import { prisma } from "@/lib/db/client";
import type { Prisma } from "@prisma/client";

export interface CandidateFilters {
  uf?: string;
  officeSlug?: string;
  partyAcronym?: string;
  query?: string;
  sort?: "az" | "za" | "numero" | "partido";
}

const CARD_SELECT = {
  id: true,
  slug: true,
  ballotName: true,
  ballotNumber: true,
  photoUrl: true,
  status: true,
  isMockData: true,
  state: { select: { uf: true, name: true } },
  office: { select: { slug: true, name: true } },
  party: { select: { acronym: true, name: true } },
} satisfies Prisma.CandidateSelect;

export type CandidateCardData = Prisma.CandidateGetPayload<{ select: typeof CARD_SELECT }>;

export async function listCandidates(filters: CandidateFilters, take = 60, skip = 0): Promise<CandidateCardData[]> {
  const where: Prisma.CandidateWhereInput = {};
  if (filters.uf) where.state = { uf: filters.uf.toUpperCase() };
  if (filters.officeSlug) where.office = { slug: filters.officeSlug };
  if (filters.partyAcronym) where.party = { acronym: filters.partyAcronym };
  if (filters.query) {
    const q = filters.query.trim();
    where.OR = [
      { ballotName: { contains: q, mode: "insensitive" } },
      { fullName: { contains: q, mode: "insensitive" } },
      { ballotNumber: { startsWith: q } },
      { party: { acronym: { contains: q, mode: "insensitive" } } },
    ];
  }

  const orderBy: Prisma.CandidateOrderByWithRelationInput[] =
    filters.sort === "za"
      ? [{ ballotName: "desc" }]
      : filters.sort === "numero"
        ? [{ ballotNumber: "asc" }]
        : filters.sort === "partido"
          ? [{ party: { acronym: "asc" } }, { ballotName: "asc" }]
          : [{ ballotName: "asc" }];

  return prisma.candidate.findMany({ where, select: CARD_SELECT, orderBy, take, skip });
}

export async function countCandidates(filters: CandidateFilters): Promise<number> {
  const where: Prisma.CandidateWhereInput = {};
  if (filters.uf) where.state = { uf: filters.uf.toUpperCase() };
  if (filters.officeSlug) where.office = { slug: filters.officeSlug };
  if (filters.partyAcronym) where.party = { acronym: filters.partyAcronym };
  if (filters.query) {
    const q = filters.query.trim();
    where.OR = [
      { ballotName: { contains: q, mode: "insensitive" } },
      { fullName: { contains: q, mode: "insensitive" } },
      { ballotNumber: { startsWith: q } },
    ];
  }
  return prisma.candidate.count({ where });
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

export async function getCandidatesForBallotSlot(uf: string, officeSlug: string) {
  return prisma.candidate.findMany({
    where: { office: { slug: officeSlug }, OR: [{ state: { uf: uf.toUpperCase() } }, { office: { slug: "presidente" } }] },
    select: CARD_SELECT,
    orderBy: { ballotName: "asc" },
  });
}
