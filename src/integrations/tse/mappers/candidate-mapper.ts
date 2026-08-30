import type { TseCandidateRow, TseAssetRow } from "../schemas/candidate.schema";
import type { RawCandidateRecord } from "../types";
import { mapCandidateOfficeCode } from "../constants/offices";

/** campo original TSE -> campo interno (docs/tse-integration.md §4) */
export function mapCandidateRow(row: TseCandidateRow, sourceUrl: string): RawCandidateRecord | null {
  const office = mapCandidateOfficeCode(row.DS_CARGO);
  if (!office) return null; // cargo fora do nosso domínio (ex. prefeito/vereador) — ignorado, não é erro

  return {
    tseCandidateId: row.SQ_CANDIDATO,
    electionYear: Number(row.ANO_ELEICAO),
    uf: row.SG_UF,
    office,
    ballotName: row.NM_URNA_CANDIDATO,
    fullName: row.NM_CANDIDATO,
    ballotNumber: row.NR_CANDIDATO,
    partyAbbreviation: row.SG_PARTIDO,
    partyNumber: Number(row.NR_PARTIDO),
    partyName: null, // não presente nesta linha — resolvido por join com o recurso de partidos, quando existir
    federation: null,
    coalition: row.NM_COLIGACAO || null,
    status: row.DS_SITUACAO_CANDIDATURA || "",
    statusDescription: null,
    occupation: row.DS_OCUPACAO || null,
    education: row.DS_GRAU_INSTRUCAO || null,
    birthDate: row.DT_NASCIMENTO || null,
    birthplace: row.NM_MUNICIPIO_NASCIMENTO || null,
    nationality: row.DS_NACIONALIDADE || null,
    photoUrl: null,
    sourceUrl,
    raw: row as unknown as Record<string, string>,
  };
}

/**
 * Converte o valor de bem declarado (formato "1234,56" ou "1234.56") para
 * centavos inteiros. Nunca usa float para dinheiro (briefing "BENS").
 */
export function parseMoneyToCents(raw: string): bigint {
  const normalized = raw.trim().replace(/\./g, "").replace(",", ".");
  const [intPart, decPart = "00"] = normalized.split(".");
  const cents = decPart.padEnd(2, "0").slice(0, 2);
  const sign = intPart.startsWith("-") ? -1n : 1n;
  const digits = intPart.replace("-", "").replace(/\D/g, "") || "0";
  return sign * (BigInt(digits) * 100n + BigInt(cents));
}

export function mapAssetRow(row: TseAssetRow): { assetType: string; description: string; valueCents: bigint } {
  return {
    assetType: row.DS_TIPO_BEM_CANDIDATO,
    description: row.DS_BEM_CANDIDATO,
    valueCents: parseMoneyToCents(row.VR_BEM_CANDIDATO),
  };
}
