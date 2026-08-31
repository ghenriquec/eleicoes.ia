import { prisma } from "@/lib/db/client";
import { syncCandidates } from "./candidate-sync";
import type { Candidate, CandidateFilters, SyncResult, TseCandidateProvider } from "../types";
import { ElectionOffice, OFFICE_SLUG_TO_ENUM, OFFICE_ENUM_TO_SLUG } from "../constants/offices";
import type { Prisma } from "@prisma/client";

type CandidateWithRelations = Prisma.CandidateGetPayload<{
  include: { state: true; office: true; party: true; round: { include: { election: true } }; assets: true };
}>;

function toDomainCandidate(row: CandidateWithRelations): Candidate {
  const totalCents = row.assets.reduce((sum, a) => sum + a.valueCents, BigInt(0));
  return {
    id: row.id,
    slug: row.slug,
    tseCandidateId: row.tseCandidateId,
    electionYear: row.round.election.year,
    state: row.state.uf,
    office: OFFICE_SLUG_TO_ENUM[row.office.slug] ?? ElectionOffice.FEDERAL_DEPUTY,
    ballotName: row.ballotName,
    fullName: row.fullName,
    ballotNumber: row.ballotNumber,
    partyNumber: row.party.tseNumber,
    partyAbbreviation: row.party.acronym,
    partyName: row.party.name,
    federation: null,
    coalition: null,
    status: row.status,
    occupation: row.occupation,
    education: row.educationLevel,
    birthDate: row.birthYear ? String(row.birthYear) : null,
    birthplace: row.placeOfBirth,
    nationality: row.nationality,
    photoUrl: row.photoUrl,
    sourceUpdatedAt: row.sourceUpdatedAt,
    declaredAssetsTotalCents: totalCents,
    isMockData: row.isMockData,
  };
}

const INCLUDE = { state: true, office: true, party: true, round: { include: { election: true } }, assets: true } as const;

export function createTseCandidateProvider(): TseCandidateProvider {
  return {
    async syncCandidates(electionYear: number): Promise<SyncResult> {
      return syncCandidates(electionYear);
    },

    async getCandidates(filters: CandidateFilters): Promise<Candidate[]> {
      const where: Prisma.CandidateWhereInput = {};
      if (filters.state) where.state = { uf: filters.state.toUpperCase() };
      if (filters.office) where.office = { slug: OFFICE_ENUM_TO_SLUG[filters.office] };
      if (filters.party) where.party = { acronym: filters.party };
      if (filters.electionYear) where.round = { election: { year: filters.electionYear } };
      if (filters.query) {
        const q = filters.query.trim();
        where.OR = [
          { ballotName: { contains: q, mode: "insensitive" } },
          { fullName: { contains: q, mode: "insensitive" } },
          { ballotNumber: { startsWith: q } },
        ];
      }

      // 2.000 cobre com folga o maior recorte real observado (SP/deputado
      // estadual, 1.426 candidatos em 2026) — sem filtro nenhum, a base
      // inteira (~20 mil) ainda é maior que isso; ver `countCandidates` em
      // src/lib/data/candidates.ts para a contagem real, independente deste limite.
      const rows = await prisma.candidate.findMany({ where, include: INCLUDE, orderBy: { ballotName: "asc" }, take: 2000 });
      return rows.map(toDomainCandidate);
    },

    async getCandidateById(id: string): Promise<Candidate | null> {
      const row = await prisma.candidate.findFirst({
        where: { OR: [{ id }, { tseCandidateId: id }, { slug: id }] },
        include: INCLUDE,
      });
      return row ? toDomainCandidate(row) : null;
    },
  };
}
