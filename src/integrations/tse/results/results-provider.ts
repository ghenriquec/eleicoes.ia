import { tseFetch } from "../client/http-client";
import { TSE_CONFIG } from "../config";
import { TseResultFileSchema } from "../schemas/results.schema";
import { normalizeResultFile } from "./normalize";
import { discoverGeneralElectionCycle } from "./discover-cycle";
import { CircuitBreaker } from "./circuit-breaker";
import { getCacheProvider, resultsCacheKey } from "../cache";
import { ElectionOffice, RESULT_OFFICE_CODE_MAP } from "../constants/offices";
import { OfficialResourceNotConfirmedError, TseSchemaValidationError } from "../errors";
import { ElectionNotYetPublishedError } from "../errors/election-not-published";
import type {
  CandidateResult,
  ElectionConfiguration,
  ElectionProgress,
  OfficeResult,
  TseResultsProvider,
} from "../types";
import { prisma } from "@/lib/db/client";

const breaker = new CircuitBreaker({ failureThreshold: 3, openDurationMs: 2 * 60_000 });

async function resolveCycle(round: number) {
  const cache = getCacheProvider();
  const key = resultsCacheKey.cycle(round);
  const cached = await cache.get<{ cdEleicao: string | null; votingDate: string | null }>(key);
  if (cached) return cached;

  const discovered = await discoverGeneralElectionCycle(round as 1 | 2);
  const value = { cdEleicao: discovered?.cdEleicao ?? null, votingDate: discovered?.votingDate ?? null };
  await cache.set(key, value, TSE_CONFIG.resultsDiscoveryIntervalMs / 1000);
  return value;
}

function officeCode(office: ElectionOffice): string {
  const code = RESULT_OFFICE_CODE_MAP[office];
  if (!code) throw new OfficialResourceNotConfirmedError(`código de resultado para o cargo ${office}`);
  return code;
}

/** Auditoria (blueprint §07/§44) — nunca derruba a resposta ao usuário se falhar. */
async function persistSnapshot(scope: string, office: ElectionOffice, file: import("../schemas/results.schema").TseResultFile) {
  try {
    const round = await prisma.electionRound.findFirst({
      where: { round: Number(file.t), election: { year: 2026 } },
      select: { id: true },
    });
    if (!round) return; // ElectionRound ainda não existe no banco local — ok, snapshot é best-effort
    await prisma.electionResultSnapshot.create({
      data: {
        roundId: round.id,
        scope,
        office,
        tseGeneratedAt: null,
        payloadHash: `${file.dg}-${file.hg}`,
        payload: file,
      },
    });
  } catch {
    // Persistência de snapshot é auditoria — nunca deve derrubar a resposta ao usuário.
  }
}

async function fetchResultFile(scope: string, office: ElectionOffice, cdEleicao: string) {
  const uf = scope.toLowerCase();
  const code = officeCode(office);
  const url = `${TSE_CONFIG.resultsBaseUrl}/ele2026/${cdEleicao}/dados-simplificados/${uf}/${uf}-c${code}-e${cdEleicao.padStart(6, "0")}-r.json`;

  if (!breaker.canAttempt()) {
    throw new ElectionNotYetPublishedError(0); // circuito aberto — chamador deve usar snapshot
  }

  try {
    const res = await tseFetch(url, { responseType: "json" });
    const parsed = TseResultFileSchema.safeParse(res.data);
    if (!parsed.success) {
      throw new TseSchemaValidationError(url, parsed.error.issues);
    }
    breaker.onSuccess();
    void persistSnapshot(scope, office, parsed.data);
    return parsed.data;
  } catch (err) {
    breaker.onFailure();
    throw err;
  }
}

export function createTseResultsProvider(): TseResultsProvider {
  return {
    async getElectionConfiguration(round: number): Promise<ElectionConfiguration> {
      const cycle = await resolveCycle(round);
      return {
        electionYear: 2026,
        round,
        cdEleicao: cycle.cdEleicao,
        votingDate: cycle.votingDate,
        discoveredAt: new Date(),
      };
    },

    async getBrazilProgress(round: number): Promise<ElectionProgress> {
      return getProgressForScope("BR", round);
    },

    async getStateProgress(uf: string, round: number): Promise<ElectionProgress> {
      return getProgressForScope(uf.toUpperCase(), round);
    },

    async getOfficeResults(uf: string, office: ElectionOffice, round: number): Promise<OfficeResult> {
      return getOffice(uf.toUpperCase(), office, round);
    },

    async getPresidentialResults(round: number): Promise<OfficeResult> {
      return getOffice("BR", ElectionOffice.PRESIDENT, round);
    },

    async getElectedCandidates(uf: string, office: ElectionOffice, round: number): Promise<CandidateResult[]> {
      const result = await getOffice(uf.toUpperCase(), office, round);
      return result.candidates.filter((c) => c.isElected);
    },
  };
}

async function getProgressForScope(scope: string, round: number): Promise<ElectionProgress> {
  const cache = getCacheProvider();
  const key = resultsCacheKey.progress(scope, round);
  const cached = await cache.get<ElectionProgress>(key);

  const cycle = await resolveCycle(round);
  if (!cycle.cdEleicao) {
    if (cached) return { ...cached, stale: true };
    throw new ElectionNotYetPublishedError(round);
  }

  try {
    const file = await fetchResultFile(scope, ElectionOffice.PRESIDENT, cycle.cdEleicao);
    const normalized = normalizeResultFile(file, { scope });
    const progress: ElectionProgress = {
      scope,
      round,
      sectionsTotal: Number(file.s),
      sectionsCounted: Number(file.st),
      percentage: normalized.totalizationPercentage,
      turnout: normalized.turnout,
      turnoutPercentage: normalized.turnoutPercentage,
      abstentionPercentage: normalized.abstentionPercentage,
      blankVotes: normalized.blankVotes,
      nullVotes: normalized.nullVotes,
      validVotes: normalized.validVotes,
      updatedAt: new Date(),
      stale: false,
    };
    await cache.set(key, progress, TSE_CONFIG.resultsSyncIntervalMs / 1000);
    return progress;
  } catch (err) {
    if (cached) return { ...cached, stale: true };
    throw err;
  }
}

async function getOffice(scope: string, office: ElectionOffice, round: number): Promise<OfficeResult> {
  const cache = getCacheProvider();
  const key = resultsCacheKey.office(scope, office, round);
  const cached = await cache.get<OfficeResult>(key);

  const cycle = await resolveCycle(round);
  if (!cycle.cdEleicao) {
    if (cached) return { ...cached, stale: true };
    throw new ElectionNotYetPublishedError(round);
  }

  try {
    const file = await fetchResultFile(scope, office, cycle.cdEleicao);
    const normalized = normalizeResultFile(file, { scope, office });
    const result: OfficeResult = {
      scope,
      office,
      round,
      seats: office === ElectionOffice.SENATOR ? 2 : 1, // briefing "SENADO 2026" — nunca assumir 1 vaga
      totalizationPercentage: normalized.totalizationPercentage,
      candidates: normalized.candidates,
      updatedAt: new Date(),
      stale: false,
    };
    await cache.set(key, result, TSE_CONFIG.resultsSyncIntervalMs / 1000);
    return result;
  } catch (err) {
    if (cached) return { ...cached, stale: true };
    throw err;
  }
}
