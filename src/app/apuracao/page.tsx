import type { Metadata } from "next";
import Link from "next/link";
import { ELECTION_CONFIG, deriveElectionStatus, isLiveResultsPhase } from "@/lib/domain/election-config";
import { LiveResults } from "@/components/results/live-results";
import { Button } from "@/components/ui/button";
import { STATES } from "@/lib/domain/states";

export const metadata: Metadata = { title: "Apuração" };
export const dynamic = "force-dynamic";

export default async function ApuracaoPage() {
  const status = deriveElectionStatus(new Date(), ELECTION_CONFIG);
  const live = isLiveResultsPhase(status) && status !== "ELECTION_DAY";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="text-center">
        {live && (
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-danger-tint px-3 py-1 font-mono text-xs font-semibold text-danger">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" /> AO VIVO
          </span>
        )}
        <h1 className="font-display text-3xl font-semibold">Apuração — Eleições 2026</h1>
        <p className="mx-auto mt-2 max-w-lg text-text-muted">
          Resultados oficiais do TSE, atualizados a partir dos arquivos publicados pela Justiça Eleitoral.
        </p>
      </div>

      <div className="mt-8">
        <LiveResults round={1} scope="BR" label="Brasil" />
      </div>

      {live && (
        <div className="mt-8 text-center">
          <Button href="/apuracao/brasil">Ver totalização nacional</Button>
        </div>
      )}

      <div className="mt-12">
        <h2 className="mb-4 text-center font-display text-lg font-semibold">Acompanhar por estado</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-9">
          {STATES.map((s) => (
            <Link
              key={s.uf}
              href={`/apuracao/${s.uf.toLowerCase()}`}
              className="rounded-xl border border-border bg-surface px-3 py-3 text-center hover:border-accent hover:bg-accent-tint"
            >
              <div className="font-mono text-sm font-semibold">{s.uf}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
