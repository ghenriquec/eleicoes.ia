import { XMLParser } from "fast-xml-parser";
import { NEWS_REQUEST_TIMEOUT_MS, type NewsSource } from "./config";

export interface RawNewsItem {
  title: string;
  link: string;
  pubDate: Date | null;
  sourceId: string;
  sourceName: string;
}

/**
 * Alguns feeds declaram charset ISO-8859-1 no Content-Type (confirmado no
 * UOL em 01/09/2026) — decodificar sempre como UTF-8 corromperia acentos
 * silenciosamente. Lê o buffer bruto e decodifica pelo charset real
 * declarado, mesmo cuidado do parser de CSV do TSE.
 */
function detectCharset(contentType: string | null): string {
  const match = contentType?.match(/charset=([^;]+)/i);
  return match ? match[1].trim().toLowerCase() : "utf-8";
}

function parsePubDate(raw: unknown): Date | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && "#text" in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>)["#text"]).trim();
  }
  return "";
}

export async function fetchRssFeed(source: NewsSource): Promise<RawNewsItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NEWS_REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(source.url, { signal: controller.signal, headers: { Accept: "application/rss+xml, application/xml, text/xml" } });
    if (!res.ok) throw new Error(`RSS ${source.id} respondeu ${res.status}`);

    const buffer = await res.arrayBuffer();
    const charset = detectCharset(res.headers.get("content-type"));
    const xml = new TextDecoder(charset).decode(buffer);

    const parser = new XMLParser({ ignoreAttributes: true, cdataPropName: "#text" });
    const parsed = parser.parse(xml) as { rss?: { channel?: { item?: unknown } } };
    const items = parsed.rss?.channel?.item;
    const itemArray = Array.isArray(items) ? items : items ? [items] : [];

    return itemArray
      .map((item) => {
        const record = item as Record<string, unknown>;
        return {
          title: asText(record.title),
          link: asText(record.link),
          pubDate: parsePubDate(asText(record.pubDate)),
          sourceId: source.id,
          sourceName: source.name,
        };
      })
      .filter((item) => item.title && item.link);
  } finally {
    clearTimeout(timeout);
  }
}
