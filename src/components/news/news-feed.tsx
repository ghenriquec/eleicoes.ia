import { ExternalLink } from "lucide-react";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { SourceIcon } from "./source-icon";
import type { ElectionNewsItem } from "@/integrations/news/election-filter";

const CATEGORY_TONE: Record<ElectionNewsItem["category"], string> = {
  Presidência: "text-accent2",
  Eleições: "text-accent-ink",
};

/**
 * Notícias reais, sempre linkando pra fonte original — nunca resumo ou
 * reescrita do conteúdo do veículo (ver src/integrations/news).
 */
export function NewsFeed({ items, emptyMessage }: { items: ElectionNewsItem[]; emptyMessage?: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-text-muted">{emptyMessage ?? "Nenhuma notícia relevante encontrada no momento."}</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {items.map((item) => (
        <li key={item.link} className="py-4 first:pt-0 last:pb-0">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide">
            <span className={CATEGORY_TONE[item.category]}>●</span>
            <span className="text-taupe-ink">{item.category}</span>
          </div>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 block font-display text-base font-semibold leading-snug hover:text-accent-ink"
          >
            {item.title}
          </a>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-text-muted">
            <SourceIcon sourceId={item.sourceId} />
            <span>{item.sourceName}</span>
            {item.pubDate && (
              <>
                <span aria-hidden="true">·</span>
                <span>{formatRelativeTime(item.pubDate)}</span>
              </>
            )}
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 font-medium text-accent-ink hover:underline">
              Ler na fonte <ExternalLink size={11} />
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
