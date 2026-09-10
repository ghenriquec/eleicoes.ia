import { prisma } from "@/lib/db/client";
import type { RawNewsItem } from "./rss-parser";

export interface ElectionNewsItem extends RawNewsItem {
  category: "Presidência" | "Eleições";
  matchedCandidateSlug: string | null;
  /** UF do candidato batido (null pra Presidente — nacional — ou item sem candidato específico) */
  matchedCandidateUf: string | null;
}

export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export const GENERIC_TERMS = ["eleições 2026", "eleição de 2026", "eleições gerais", "corrida presidencial", "presidenciáveis"].map(normalize);

export interface CandidateKeyword {
  slug: string;
  office: string;
  uf: string;
  normalizedName: string;
  /** contexto que corrobora um match de nome de uma palavra só (evita "Gabriel" batendo em notícia de futebol) */
  corroborators: string[];
}

let cachedKeywords: CandidateKeyword[] | null = null;

/**
 * Só Presidente e Governador entram no radar do feed editorial (mesmo
 * recorte que o usuário pediu para "Propostas" — deputados/senadores
 * continuam existindo na busca normal, sem destaque editorial aqui).
 */
async function getCandidateKeywords(): Promise<CandidateKeyword[]> {
  if (cachedKeywords) return cachedKeywords;
  const candidates = await prisma.candidate.findMany({
    where: { office: { slug: { in: ["presidente", "governador"] } } },
    select: {
      slug: true,
      ballotName: true,
      office: { select: { slug: true } },
      party: { select: { acronym: true } },
      state: { select: { uf: true, name: true } },
    },
  });
  cachedKeywords = candidates.map((c) => buildKeyword(c.slug, c.ballotName, c.office.slug, c.party.acronym, c.state.uf, c.state.name));
  return cachedKeywords;
}

/**
 * usa o nome de urna (como a imprensa de fato chama o candidato: "Lula", "Zema",
 * "Pablo Marçal") em vez do nome completo — mas nome de uma palavra só (comum:
 * "Gabriel", "Marcos") só conta se a manchete também tiver algo que corrobore
 * (partido, estado, "presidente"/"governador", termo genérico de eleição) —
 * achado real: "Gabriel" bateu numa notícia de futebol sobre Gabriel Jesus.
 */
export function buildKeyword(slug: string, ballotName: string, office: string, partyAcronym: string, uf: string, stateName: string): CandidateKeyword {
  return {
    slug,
    office,
    uf,
    normalizedName: normalize(ballotName),
    corroborators: [normalize(partyAcronym), normalize(stateName), office === "presidente" ? "presidente" : "governador"],
  };
}

export function matchesWholeWord(haystack: string, needle: string): boolean {
  if (!needle) return false;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\W)${escaped}(\\W|$)`, "i").test(haystack);
}

/** Lógica pura de matching — sem I/O, testada diretamente em election-filter.test.ts. */
export function tagItemsAgainstKeywords(items: RawNewsItem[], keywords: CandidateKeyword[]): ElectionNewsItem[] {
  const tagged: ElectionNewsItem[] = [];
  const eligibleKeywords = keywords.filter((k) => k.normalizedName.replace(/\s/g, "").length >= 4);

  for (const item of items) {
    const haystack = normalize(item.title);
    const isMultiWord = (name: string) => name.includes(" ");

    // uma manchete pode conter mais de um nome de urna ao mesmo tempo (ex.: "Renan
    // Santos e Missão" também corrobora um OUTRO candidato chamado só "Renan") — entre
    // os que batem, prefere sempre o nome mais específico (multi-palavra > uma palavra
    // corroborada), não o primeiro da lista.
    const allMatches = eligibleKeywords.filter((k) => {
      if (!matchesWholeWord(haystack, k.normalizedName)) return false;
      if (isMultiWord(k.normalizedName)) return true;
      return k.corroborators.some((c) => matchesWholeWord(haystack, c)) || GENERIC_TERMS.some((term) => haystack.includes(term));
    });
    const candidateMatch = allMatches.sort((a, b) => b.normalizedName.length - a.normalizedName.length)[0];
    if (candidateMatch) {
      tagged.push({
        ...item,
        category: candidateMatch.office === "presidente" ? "Presidência" : "Eleições",
        matchedCandidateSlug: candidateMatch.slug,
        matchedCandidateUf: candidateMatch.office === "presidente" ? null : candidateMatch.uf,
      });
      continue;
    }

    if (GENERIC_TERMS.some((term) => haystack.includes(term))) {
      tagged.push({ ...item, category: "Eleições", matchedCandidateSlug: null, matchedCandidateUf: null });
    }
  }

  return tagged;
}

export async function tagElectionRelevance(items: RawNewsItem[]): Promise<ElectionNewsItem[]> {
  const keywords = await getCandidateKeywords();
  return tagItemsAgainstKeywords(items, keywords);
}
