import { ELECTION_CONFIG, deriveElectionStatus, isLiveResultsPhase } from "@/lib/domain/election-config";

const STATUS_COPY: Record<string, { label: string; tone: "neutral" | "live" }> = {
  PRE_ELECTION: { label: "Eleições Gerais 2026", tone: "neutral" },
  ELECTION_DAY: { label: "Dia da eleição — as urnas estão abertas", tone: "live" },
  COUNTING: { label: "Apuração em andamento", tone: "live" },
  SECOND_ROUND_PREPARATION: { label: "2º turno em preparação", tone: "neutral" },
  SECOND_ROUND_COUNTING: { label: "Apuração do 2º turno em andamento", tone: "live" },
  FINISHED: { label: "Resultado do 1º turno finalizado", tone: "neutral" },
  CLOSED: { label: "Eleições 2026 encerradas", tone: "neutral" },
};

export function ElectionStatusBanner() {
  const status = deriveElectionStatus(new Date(), ELECTION_CONFIG);
  const copy = STATUS_COPY[status];
  const live = isLiveResultsPhase(status);

  return (
    <div className="border-b border-border bg-surface-2 text-[13px]">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 sm:px-6">
        {live && <span className="h-1.5 w-1.5 flex-none animate-pulse rounded-full bg-danger" aria-hidden />}
        <span className="font-medium text-text-muted">{copy.label}</span>
        <span className="ml-auto font-mono text-[11px] text-taupe-ink">
          1º turno 04/10/2026 · 2º turno 25/10/2026
        </span>
      </div>
    </div>
  );
}
