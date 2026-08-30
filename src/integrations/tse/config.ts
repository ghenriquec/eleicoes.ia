/**
 * Configuração central da integração TSE. Nenhuma URL do TSE deve aparecer
 * fora deste arquivo (briefing "VARIÁVEIS DE AMBIENTE" / "SEGURANÇA").
 * Ver docs/tse-integration.md para a proveniência de cada valor.
 */

function env(name: string, fallback?: string): string {
  const v = process.env[name];
  if (v && v.length > 0) return v;
  if (fallback !== undefined) return fallback;
  throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
}

function envOptional(name: string): string | null {
  const v = process.env[name];
  return v && v.length > 0 ? v : null;
}

function envInt(name: string, fallback: number): number {
  const v = process.env[name];
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export const TSE_CONFIG = {
  // --- Dados abertos (candidaturas) ---
  openDataBaseUrl: env("TSE_OPEN_DATA_BASE_URL", "https://dadosabertos.tse.jus.br"),
  candidatesDatasetUrl: env(
    "TSE_CANDIDATES_DATASET_URL",
    "https://dadosabertos.tse.jus.br/dataset/candidatos-2026",
  ),
  /** Padrão de CDN confirmado (docs/tse-integration.md §1) — ainda não executado com sucesso deste ambiente. */
  candidatesCdnBaseUrl: env(
    "TSE_CANDIDATES_CDN_BASE_URL",
    "https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand",
  ),
  candidatesComplementaryUrl: env(
    "TSE_CANDIDATES_COMPLEMENTARY_URL",
    "https://divulgacandcontas.tse.jus.br/divulga/",
  ),

  // --- Resultados / apuração ---
  resultsBaseUrl: env("TSE_RESULTS_BASE_URL", "https://resultados.tse.jus.br/oficial"),
  resultsInfoUrl: env(
    "TSE_RESULTS_INFO_URL",
    "https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados",
  ),

  // --- Timeouts e intervalos (nenhum valor de produção sem confirmação — docs §5) ---
  requestTimeoutMs: envInt("TSE_REQUEST_TIMEOUT", 15_000),
  candidatesSyncIntervalMs: envInt("TSE_CANDIDATES_SYNC_INTERVAL", 12 * 60 * 60 * 1000),
  resultsDiscoveryIntervalMs: envInt("TSE_RESULTS_DISCOVERY_INTERVAL", 30 * 60 * 1000),
  resultsSyncIntervalMs: envInt("TSE_RESULTS_SYNC_INTERVAL", 60_000),

  // --- Infra ---
  databaseUrl: envOptional("DATABASE_URL"),
  redisUrl: envOptional("REDIS_URL"),
  rawStorageBucket: envOptional("TSE_RAW_STORAGE_BUCKET"),

  /** mock | tse-simulation | production */
  resultsMode: (envOptional("RESULTS_MODE") ?? "mock") as "mock" | "tse-simulation" | "production",
} as const;

/**
 * Allowlist de hosts que o TseHttpClient tem permissão de acessar (proteção
 * contra SSRF — briefing "SEGURANÇA": nunca aceitar URL arbitrária de usuário).
 */
export const TSE_ALLOWED_HOSTS = new Set([
  "dadosabertos.tse.jus.br",
  "cdn.tse.jus.br",
  "divulgacandcontas.tse.jus.br",
  "resultados.tse.jus.br",
  "www.tse.jus.br",
]);
