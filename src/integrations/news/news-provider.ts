import { getCacheProvider } from "../tse/cache";
import { NEWS_SOURCES, NEWS_CACHE_TTL_SECONDS } from "./config";
import { fetchRssFeed } from "./rss-parser";
import { tagElectionRelevance, type ElectionNewsItem } from "./election-filter";
import { tseLog } from "../tse/logger";

const CACHE_KEY = "news:election:2026";

/**
 * Notícias reais de veículos de imprensa (RSS público — nunca headline
 * inventada). Cada item sempre linka pra fonte original. Fontes que
 * falharem no fetch não derrubam as demais — o feed sai parcial, não vazio.
 */
export async function getLatestElectionNews(limit = 30): Promise<ElectionNewsItem[]> {
  const cache = getCacheProvider();
  const cached = await cache.get<ElectionNewsItem[]>(CACHE_KEY);
  if (cached) return cached.slice(0, limit);

  const results = await Promise.allSettled(NEWS_SOURCES.map((s) => fetchRssFeed(s)));
  const rawItems = results.flatMap((r, i) => {
    if (r.status === "fulfilled") return r.value;
    tseLog.warn("news_source_failed", { source: NEWS_SOURCES[i].id, error: r.reason instanceof Error ? r.reason.message : String(r.reason) });
    return [];
  });

  const tagged = await tagElectionRelevance(rawItems);

  const seen = new Set<string>();
  const deduped = tagged.filter((item) => (seen.has(item.link) ? false : (seen.add(item.link), true)));
  deduped.sort((a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0));

  await cache.set(CACHE_KEY, deduped, NEWS_CACHE_TTL_SECONDS);
  tseLog.info("news_refreshed", { totalRaw: rawItems.length, matched: deduped.length });

  return deduped.slice(0, limit);
}
