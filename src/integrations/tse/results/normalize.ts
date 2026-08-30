import type { TseResultFile } from "../schemas/results.schema";
import type { CandidateResult } from "../types";
import type { ElectionOffice } from "../constants/offices";

/**
 * Normaliza o JSON bruto de resultado do TSE para o formato interno.
 * Nunca recalcula `officialStatus`/eleito — sempre repassa o valor do TSE
 * (briefing "RESULTADOS OFICIAIS"). Percentuais no formato "50,90" viram
 * number 50.9 (ponto flutuante é aceitável aqui — percentuais de exibição,
 * não dinheiro).
 */

function parsePercent(value: string | undefined): number {
  if (!value) return 0;
  return Number(value.replace(",", "."));
}

function parseIntSafe(value: string | undefined): number {
  if (!value) return 0;
  return Number(value);
}

export interface NormalizedOfficeResult {
  scope: string;
  office?: ElectionOffice;
  round: number;
  totalizationPercentage: number;
  turnout: number | null;
  turnoutPercentage: number | null;
  abstentionPercentage: number | null;
  blankVotes: number | null;
  nullVotes: number | null;
  validVotes: number | null;
  candidates: CandidateResult[];
  tseGeneratedAt: string;
}

export function normalizeResultFile(
  file: TseResultFile,
  opts: { scope: string; office?: ElectionOffice },
): NormalizedOfficeResult {
  const candidates: CandidateResult[] = [...file.cand]
    .map((c) => ({
      candidateId: c.sqcand,
      ballotName: c.nm,
      ballotNumber: c.n,
      runningMateName: c.nv?.trim() ? c.nv.trim() : null,
      party: c.cc,
      votes: parseIntSafe(c.vap),
      percentage: parsePercent(c.pvap),
      rank: 0, // preenchido abaixo
      officialStatus: c.st,
      isElected: c.e === "s",
    }))
    .sort((a, b) => b.votes - a.votes)
    .map((c, i) => ({ ...c, rank: i + 1 }));

  return {
    scope: opts.scope,
    office: opts.office,
    round: Number(file.t),
    totalizationPercentage: parsePercent(file.pst),
    turnout: file.c ? parseIntSafe(file.c) : null,
    turnoutPercentage: file.pc ? parsePercent(file.pc) : null,
    abstentionPercentage: file.pa ? parsePercent(file.pa) : null,
    blankVotes: file.vb ? parseIntSafe(file.vb) : null,
    nullVotes: file.vn ? parseIntSafe(file.vn) : null,
    validVotes: file.vv ? parseIntSafe(file.vv) : null,
    candidates,
    tseGeneratedAt: `${file.dg} ${file.hg}`,
  };
}
