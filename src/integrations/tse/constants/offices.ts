/**
 * Enum interno de cargos + mapeamento para os códigos oficiais do TSE.
 *
 * O código de `DS_CARGO` (dataset de candidatos) é o **nome por extenso**
 * (ex. "DEPUTADO FEDERAL"), confirmado por múltiplas fontes — mapeamento
 * direto, sem ambiguidade.
 *
 * Já o código numérico de cargo usado nas URLs de resultado
 * (`...-c{cargo:04d}-...`) foi observado ao vivo apenas para dois valores
 * em 2022 (docs/tse-integration.md §3): `0001` = Presidente, `0007` = uma
 * eleição proporcional em UF (correspondeu a Deputado Federal na amostra).
 * Os demais códigos (Governador, Senador, Deputado Estadual/Distrital)
 * **não foram confirmados** nesta sessão — ⚠️ ver `RESULT_OFFICE_CODE_MAP`.
 */
export enum ElectionOffice {
  PRESIDENT = "PRESIDENT",
  GOVERNOR = "GOVERNOR",
  SENATOR = "SENATOR",
  FEDERAL_DEPUTY = "FEDERAL_DEPUTY",
  STATE_DEPUTY = "STATE_DEPUTY",
  DISTRICT_DEPUTY = "DISTRICT_DEPUTY",
}

/** DS_CARGO (dataset de candidatos) -> ElectionOffice. Nome por extenso, estável. */
export const CANDIDATE_OFFICE_CODE_MAP: Record<string, ElectionOffice> = {
  "PRESIDENTE": ElectionOffice.PRESIDENT,
  "GOVERNADOR": ElectionOffice.GOVERNOR,
  "SENADOR": ElectionOffice.SENATOR,
  "DEPUTADO FEDERAL": ElectionOffice.FEDERAL_DEPUTY,
  "DEPUTADO ESTADUAL": ElectionOffice.STATE_DEPUTY,
  "DEPUTADO DISTRITAL": ElectionOffice.DISTRICT_DEPUTY,
};

/**
 * Código numérico de cargo usado na URL de resultado (`c{XXXX}`).
 * ✅ = confirmado ao vivo. ⚠️ = inferido, precisa de validação antes de
 * usar em produção (o discovery a partir de `ele-c.json` deve ser preferido
 * sempre que disponível — ver `results/discover-cycle.ts`).
 */
export const RESULT_OFFICE_CODE_MAP: Partial<Record<ElectionOffice, string>> = {
  [ElectionOffice.PRESIDENT]: "0001", // ✅ confirmado ao vivo (2022)
  [ElectionOffice.FEDERAL_DEPUTY]: "0007", // ⚠️ inferido da amostra AP/2022 — validar
};

export function mapCandidateOfficeCode(dsCargo: string): ElectionOffice | null {
  return CANDIDATE_OFFICE_CODE_MAP[dsCargo.trim().toUpperCase()] ?? null;
}
