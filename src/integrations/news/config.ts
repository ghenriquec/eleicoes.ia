/**
 * Fontes de notícias — feeds RSS públicos, oficialmente publicados por cada
 * veículo para consumo por terceiros (nunca scraping de HTML, nunca burla
 * de bot-detection). Todas testadas em 01/09/2026: acesso direto via
 * servidor, sem bloqueio — diferente dos hosts do TSE.
 */

export interface NewsSource {
  id: string;
  name: string;
  url: string;
}

export const NEWS_SOURCES: NewsSource[] = [
  { id: "g1", name: "G1", url: "https://g1.globo.com/rss/g1/politica/" },
  { id: "uol", name: "UOL", url: "https://rss.uol.com.br/feed/noticias.xml" },
  { id: "cnn-brasil", name: "CNN Brasil", url: "https://www.cnnbrasil.com.br/feed/" },
  { id: "bbc-brasil", name: "BBC News Brasil", url: "https://feeds.bbci.co.uk/portuguese/rss.xml" },
];

export const NEWS_CACHE_TTL_SECONDS = 15 * 60; // 15 min — igual à cadência real de publicação desses feeds
export const NEWS_REQUEST_TIMEOUT_MS = 10_000;
