"use client";

import { useEffect, useState } from "react";
import { NewsFeed } from "@/components/news/news-feed";
import { Select } from "@/components/ui/select";
import { getSavedUF } from "@/lib/local-storage/storage";
import { getState, STATES } from "@/lib/domain/states";
import type { ElectionNewsItem } from "@/integrations/news/election-filter";

type Scope = "estado" | "brasil";

/**
 * Presidenciáveis (nacional) sempre aparecem nos dois modos. Em "meu estado"
 * só entra o governador de fato do estado escolhido — itens genéricos sem
 * candidato específico (ex.: "veja os candidatos de todos os estados") ficam
 * de fora, senão a maioria das notícias aparece nos dois modos e o filtro
 * parece não fazer nada (achado real: quase todo item batido é genérico).
 */
function filterByScope(items: ElectionNewsItem[], scope: Scope, uf: string | null): ElectionNewsItem[] {
  if (scope === "brasil") return items;
  return items.filter((item) => item.category === "Presidência" || item.matchedCandidateUf === uf);
}

export function NoticiasClient({ initialNews }: { initialNews: ElectionNewsItem[] }) {
  const [scope, setScope] = useState<Scope>("brasil");
  const [uf, setUf] = useState<string | null>(null);
  const [pickingState, setPickingState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hidratação única a partir do localStorage (o mesmo estado detectado por
    // geolocalização em LocationDetector) — hidratação só no mount, padrão pra evitar mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUf(getSavedUF());
    setHydrated(true);
  }, []);

  const filtered = filterByScope(initialNews, scope, uf);
  const stateName = uf ? (getState(uf)?.name ?? uf) : null;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface-2 p-1">
        <ScopeButton active={scope === "brasil"} onClick={() => setScope("brasil")}>
          Brasil todo + presidenciáveis
        </ScopeButton>
        <ScopeButton
          active={scope === "estado"}
          onClick={() => {
            setScope("estado");
            if (!uf) setPickingState(true);
          }}
        >
          {stateName ? `${stateName} + presidenciáveis` : "Meu estado + presidenciáveis"}
        </ScopeButton>
      </div>

      {hydrated && scope === "estado" && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {stateName && !pickingState ? (
            <>
              <span className="text-text-muted">
                Mostrando notícias de <strong className="text-text">{stateName}</strong>
              </span>
              <button onClick={() => setPickingState(true)} className="font-medium text-accent-ink hover:underline">
                Trocar estado
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-border-strong bg-surface p-3">
              <span className="text-text-muted">Qual é o seu estado?</span>
              <Select
                className="w-auto py-1.5 text-sm"
                value={uf ?? ""}
                onChange={(e) => {
                  setUf(e.target.value);
                  setPickingState(false);
                }}
              >
                <option value="">Selecione…</option>
                {STATES.map((s) => (
                  <option key={s.uf} value={s.uf}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <NewsFeed
          items={filtered}
          emptyMessage={
            scope === "estado" && !uf
              ? "Escolha seu estado acima pra ver as notícias do governo estadual."
              : "Nenhuma notícia relevante encontrada no momento."
          }
        />
      </div>
    </div>
  );
}

function ScopeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors ${
        active ? "bg-surface text-accent-ink shadow-sm" : "text-text-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}
