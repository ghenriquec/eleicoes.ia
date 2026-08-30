/**
 * Configuração central dos endpoints do TSE (briefing §5, §6, §62).
 * Nenhuma URL aqui foi inventada — todas vêm da pesquisa registrada em
 * docs/tse-integration.md (30/08/2026). Onde o schema exato de download
 * ainda não foi confirmado manualmente, o valor fica null e o adapter
 * correspondente lança OficialResourceNotConfirmedError em vez de adivinhar.
 */

function readEnv(name: string): string | null {
  const value = process.env[name];
  return value && value.length > 0 ? value : null;
}

export const TSE_CONFIG = {
  /** Portal de Dados Abertos — dataset "Candidatos - 2026". Confirmado. */
  candidatesDatasetUrl: readEnv("TSE_CANDIDATES_DATASET_URL") ?? "https://dadosabertos.tse.jus.br/dataset/candidatos-2026",

  /** DivulgaCandContas — complementar/validação de candidaturas e contas. Confirmado. */
  candidatesComplementaryUrl:
    readEnv("TSE_CANDIDATES_COMPLEMENTARY_URL") ?? "https://divulgacandcontas.tse.jus.br/divulga/",

  /**
   * Recursos individuais do dataset Candidatos-2026 (CSV/JSON de candidatos, bens,
   * fotos, redes sociais, proposta de governo). Os `resource id` reais foram
   * observados na pesquisa de 30/08/2026, mas mudam por atualização do portal —
   * resolvidos em runtime pelo Ingestion Worker a partir do dataset, nunca fixados
   * aqui como URL direta (ver docs/tse-integration.md).
   */
  candidatesAssetsUrl: readEnv("TSE_ASSETS_URL"),
  candidatesSocialNetworksUrl: readEnv("TSE_SOCIAL_NETWORKS_URL"),
  candidatesCoalitionsUrl: readEnv("TSE_COALITIONS_URL"),
  candidatesPhotosBaseUrl: readEnv("TSE_CANDIDATE_PHOTOS_BASE_URL"),
  governmentProposalsBaseUrl: readEnv("TSE_GOVERNMENT_PROPOSALS_BASE_URL"),

  /** Informações técnicas sobre a divulgação de resultados 2026. Confirmado, mas
   *  retornou 403 para fetch automatizado — pendência #2 do blueprint. */
  resultsInfoUrl: readEnv("TSE_RESULTS_INFO_URL") ?? "https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados",
  resultsFilesUrl: readEnv("TSE_RESULTS_FILES_URL") ?? "https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/divulgacao-de-resultados",
  resultsPortalUrl: readEnv("TSE_RESULTS_PORTAL_URL") ?? "https://resultados.tse.jus.br/oficial/",

  /** Schema exato de URL de download dos arquivos EA10-EA20 — NÃO confirmado ainda. */
  resultsDownloadBaseUrl: readEnv("TSE_RESULTS_DOWNLOAD_BASE_URL"),

  /** mock | tse-simulation | production (briefing §76). */
  resultsMode: (readEnv("RESULTS_MODE") ?? "mock") as "mock" | "tse-simulation" | "production",

  syncIntervalMs: Number(readEnv("TSE_SYNC_INTERVAL_MS") ?? 12 * 60 * 60 * 1000),
  resultsSyncIntervalMs: readEnv("RESULTS_SYNC_INTERVAL") ? Number(readEnv("RESULTS_SYNC_INTERVAL")) : null,
} as const;

export class OfficialResourceNotConfirmedError extends Error {
  constructor(resource: string) {
    super(
      `A URL oficial de "${resource}" ainda não foi confirmada na documentação técnica do TSE. ` +
        `Ver blueprint §19 (Decisões Pendentes #2) e docs/tse-integration.md antes de configurar em produção.`,
    );
    this.name = "OfficialResourceNotConfirmedError";
  }
}
