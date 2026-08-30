import type { Candidate, CandidateAsset, OfficeResult, ElectionProgress, CandidateResult } from "./types";

/** BigInt não serializa em JSON.stringify — converte para string nos limites da API. */
export function serializeCandidate(c: Candidate) {
  return { ...c, declaredAssetsTotalCents: c.declaredAssetsTotalCents.toString() };
}

export function serializeAsset(a: CandidateAsset) {
  return { ...a, valueCents: a.valueCents.toString() };
}

export function serializeOfficeResult(r: OfficeResult) {
  return r;
}

export function serializeProgress(p: ElectionProgress) {
  return p;
}

export function serializeCandidateResult(c: CandidateResult) {
  return c;
}
