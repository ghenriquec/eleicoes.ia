import { TSE_CONFIG } from "../config";
import { InMemoryCacheProvider, type CacheProvider } from "./cache-provider";
import { RedisCacheProvider } from "./redis-cache-provider";

let instance: CacheProvider | null = null;

/** Redis se REDIS_URL estiver configurada; memória em dev local sem infra extra. */
export function getCacheProvider(): CacheProvider {
  if (!instance) {
    instance = TSE_CONFIG.redisUrl ? new RedisCacheProvider(TSE_CONFIG.redisUrl) : new InMemoryCacheProvider();
  }
  return instance;
}

export type { CacheProvider };

/** Chaves de cache de resultados (blueprint §12 — nomes conceituais). */
export const resultsCacheKey = {
  progress: (scope: string, round: number) => `election:2026:round:${round}:${scope.toLowerCase()}:progress`,
  office: (scope: string, office: string, round: number) =>
    `election:2026:round:${round}:${scope.toLowerCase()}:${office.toLowerCase()}`,
  cycle: (round: number) => `election:2026:round:${round}:cycle`,
};
