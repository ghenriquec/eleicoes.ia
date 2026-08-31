import type { TseCandidateRow, TseAssetRow } from "../schemas/candidate.schema";
import type { RawCandidateRecord } from "../types";
import { mapCandidateOfficeCode } from "../constants/offices";

/**
 * O TSE usa os literais "#NULO" e "#NE" (e variações de caixa) como
 * marcadores de "sem valor"/"não especificado" — nunca devem virar texto
 * visível na interface. Ver docs/tse-integration.md §4.
 */
export function tseNullable(value: string | undefined | null): string | null {
  const v = (value ?? "").trim();
  if (!v || v.toUpperCase() === "#NULO" || v.toUpperCase() === "#NE" || v === "-1" || v === "-3") return null;
  return v;
}

/** campo original TSE -> campo interno (docs/tse-integration.md §4, confirmado contra arquivo real de 2026) */
export function mapCandidateRow(row: TseCandidateRow, sourceUrl: string): RawCandidateRecord | null {
  const office = mapCandidateOfficeCode(row.DS_CARGO);
  if (!office) return null; // cargo fora do nosso domínio (suplente, vice, prefeito, vereador etc.) — ignorado, não é erro

  const status = tseNullable(row.DS_SITUACAO_CANDIDATURA);

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
    partyName: tseNullable(row.NM_PARTIDO),
    federation: tseNullable(row.NM_FEDERACAO),
    coalition: tseNullable(row.NM_COLIGACAO),
    // "#NE" = Justiça Eleitoral ainda não concluiu a análise da candidatura —
    // nunca mostrar como "deferida"/"indeferida" quando o TSE não decidiu.
    status: status ?? "AGUARDANDO ANÁLISE DA JUSTIÇA ELEITORAL",
    statusDescription: null,
    occupation: tseNullable(row.DS_OCUPACAO),
    education: tseNullable(row.DS_GRAU_INSTRUCAO),
    birthDate: tseNullable(row.DT_NASCIMENTO),
    birthplace: tseNullable(row.SG_UF_NASCIMENTO),
    nationality: null, // não presente no dataset de candidatos — nunca inferido
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
