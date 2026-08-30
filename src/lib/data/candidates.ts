import { prisma } from "@/lib/db/client";
import { getTseElectionDataProvider } from "@/integrations/tse";
import { OFFICE_ENUM_TO_SLUG, OFFICE_SLUG_TO_ENUM } from "@/integrations/tse/constants/offices";
import type { Candidate as TseCandidate } from "@/integrations/tse";

/**
 * Camada de leitura do frontend para listagens de candidatos. Busca sempre
 * passa pelo `TseElectionDataProvider` (fonte única de verdade) — este
 * arquivo só adapta o formato plano do provider para o shape que os
 * componentes de UI já esperam, e adiciona ordenação/paginação, que são
 * uma preocupação de produto, não do dado oficial em si.
 *
 * `getCandidateBySlug` é a exceção: a página de perfil precisa de relações
 * (bens, redes sociais, plano de governo, fontes, posições do quiz) que não
 * fazem parte do contrato oficial do TSE — por isso segue consultando o
 * banco diretamente.
 */

export interface CandidateFilters {
  uf?: string;
  officeSlug?: string;
  partyAcronym?: string;
  query?: string;
  sort?: "az" | "za" | "numero" | "partido";
}

export interface CandidateCardData {
  id: string;
  slug: string;
  ballotName: string;
  ballotNumber: string;
  photoUrl: string | null;
  status: string;
  isMockData: boolean;
  state: { uf: string; name: string };
  office: { slug: string; name: string };
  party: { acronym: string; name: string | null };
}

function toCard(c: TseCandidate, stateName: string, officeName: string): CandidateCardData {
  return {
    id: c.id,
    slug: c.slug,
    ballotName: c.ballotName,
    ballotNumber: c.ballotNumber,
    photoUrl: c.photoUrl,
    status: c.status,
    isMockData: c.isMockData,
    state: { uf: c.state, name: stateName },
    office: { slug: OFFICE_ENUM_TO_SLUG[c.office], name: officeName },
    party: { acronym: c.partyAbbreviation, name: c.partyName },
  };
}

const OFFICE_SLUG_TO_NAME: Record<string, string> = {
  presidente: "Presidente da República",
  governador: "Governador",
  senador: "Senador",
  "deputado-federal": "Deputado Federal",
  "deputado-estadual": "Deputado Estadual",
  "deputado-distrital": "Deputado Distrital",
};

async function fetchAndAdaptCandidates(filters: CandidateFilters): Promise<CandidateCardData[]> {
  const tse = getTseElectionDataProvider();
  const results = await tse.candidates.find({
    electionYear: 2026,
    state: filters.uf,
    office: filters.officeSlug ? OFFICE_SLUG_TO_ENUM[filters.officeSlug] : undefined,
    party: filters.partyAcronym,
    query: filters.query,
  });

  // Estado é usado só para o rótulo do card — busca em lote para não gerar 1 query por candidato.
  const stateNames = new Map((await prisma.state.findMany({ select: { uf: true, name: true } })).map((s) => [s.uf, s.name]));

  let cards = results.map((c) => toCard(c, stateNames.get(c.state) ?? c.state, OFFICE_SLUG_TO_NAME[OFFICE_ENUM_TO_SLUG[c.office]] ?? c.office));

  // Busca livre também casa com sigla do partido — o provider oficial só
  // busca em nome/número (dado TSE puro); isso é refinamento de produto.
  if (filters.query) {
    const q = filters.query.trim().toLowerCase();
    const matchesParty = (c: CandidateCardData) => c.party.acronym.toLowerCase().includes(q);
    const already = new Set(cards.map((c) => c.id));
    const extra = (
      await tse.candidates.find({
        electionYear: 2026,
        state: filters.uf,
        office: filters.officeSlug ? OFFICE_SLUG_TO_ENUM[filters.officeSlug] : undefined,
      })
    )
      .map((c) => toCard(c, stateNames.get(c.state) ?? c.state, OFFICE_SLUG_TO_NAME[OFFICE_ENUM_TO_SLUG[c.office]] ?? c.office))
      .filter((c) => matchesParty(c) && !already.has(c.id));
    cards = [...cards, ...extra];
  }

  cards.sort((a, b) => {
    switch (filters.sort) {
      case "za":
        return b.ballotName.localeCompare(a.ballotName);
      case "numero":
        return a.ballotNumber.localeCompare(b.ballotNumber);
      case "partido":
        return a.party.acronym.localeCompare(b.party.acronym) || a.ballotName.localeCompare(b.ballotName);
      default:
        return a.ballotName.localeCompare(b.ballotName);
    }
  });

  return cards;
}

export async function listCandidates(filters: CandidateFilters, take = 60, skip = 0): Promise<CandidateCardData[]> {
  const all = await fetchAndAdaptCandidates(filters);
  return all.slice(skip, skip + take);
}

export async function countCandidates(filters: CandidateFilters): Promise<number> {
  const all = await fetchAndAdaptCandidates(filters);
  return all.length;
}

export async function getCandidateBySlug(slug: string) {
  return prisma.candidate.findUnique({
    where: { slug },
    include: {
      state: true,
      office: true,
      party: true,
      coalition: true,
      assets: true,
      socialNetworks: true,
      documents: true,
      sources: true,
      proposal: { include: { excerpts: { include: { topic: true } } } },
      topicPositions: { include: { question: { include: { topic: true } } } },
      results: true,
    },
  });
}

export async function listPartyAcronyms(): Promise<string[]> {
  const parties = await prisma.party.findMany({ select: { acronym: true }, orderBy: { acronym: "asc" } });
  return parties.map((p) => p.acronym);
}
