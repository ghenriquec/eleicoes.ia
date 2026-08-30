import { CheckCircle2, Radio, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ElectionCountdown } from "./election-countdown";
import { ELECTION_CONFIG, deriveElectionStatus } from "@/lib/domain/election-config";
import { getTseElectionDataProvider } from "@/integrations/tse";
import type { ElectionOffice } from "@/integrations/tse/constants/offices";

/**
 * Painel de apuração que consulta o TSE de verdade a cada carregamento (via
 * `TseElectionDataProvider`, com cache/circuit breaker por baixo — nunca é o
 * navegador do usuário batendo direto no TSE). Mostra dado real quando o
 * pleito já foi publicado; enquanto não for, mostra o horário exato da
 * última checagem ao vivo em vez de um "em breve" estático.
 */
export async function LiveResults({
  round,
  scope,
  office,
  label,
}: {
  round: number;
  scope: string;
  office?: ElectionOffice;
  label: string;
}) {
  const tse = getTseElectionDataProvider();
  const config = await tse.results.getElectionConfiguration(round).catch(() => null);

  if (!config?.cdEleicao) {
    return <NotPublishedYet round={round} label={label} checkedAt={config?.discoveredAt ?? null} />;
  }

  // Pleito publicado — busca o dado real. Este caminho ainda não foi
  // exercitado com um pleito de verdade nesta sessão (ver docs/tse-integration.md),
  // mas está pronto para quando o TSE publicar. Busca fica isolada do JSX
  // (try/catch só ao redor do await) para caber no error-boundary do React.
  const fetched = await fetchResultData(tse, { scope, office, round });
  if (!fetched) {
    return <NotPublishedYet round={round} label={label} checkedAt={config.discoveredAt} degraded />;
  }
  return fetched.kind === "office" ? (
    <OfficeResultsPanel result={fetched.result} label={label} />
  ) : (
    <ProgressPanel progress={fetched.progress} label={label} />
  );
}

type FetchedResult =
  | { kind: "office"; result: import("@/integrations/tse").OfficeResult }
  | { kind: "progress"; progress: import("@/integrations/tse").ElectionProgress };

async function fetchResultData(
  tse: ReturnType<typeof getTseElectionDataProvider>,
  args: { scope: string; office?: ElectionOffice; round: number },
): Promise<FetchedResult | null> {
  try {
    if (args.office) {
      const result = await tse.results.getOfficeResults(args.scope, args.office, args.round);
      return { kind: "office", result };
    }
    const progress =
      args.scope === "BR" ? await tse.results.getBrazilProgress(args.round) : await tse.results.getStateProgress(args.scope, args.round);
    return { kind: "progress", progress };
  } catch {
    return null;
  }
}

function NotPublishedYet({
  round,
  label,
  checkedAt,
  degraded,
}: {
  round: number;
  label: string;
  checkedAt: Date | null;
  degraded?: boolean;
}) {
  const status = deriveElectionStatus(new Date(), ELECTION_CONFIG);
  const targetDate = round === 2 ? ELECTION_CONFIG.secondRoundDate : ELECTION_CONFIG.firstRoundDate;

  return (
    <Card className="mx-auto max-w-md py-10 text-center">
      {status === "PRE_ELECTION" ? (
        <ElectionCountdown target={targetDate.toISOString()} label={`${round}º turno em`} />
      ) : (
        <>
          <Radio size={22} className="mx-auto text-taupe-ink" />
          <p className="mt-3 font-medium">Dado ainda não disponibilizado pelo TSE.</p>
        </>
      )}
      <p className="mt-4 text-sm text-text-muted">
        {degraded
          ? `A apuração de ${label} começou, mas tivemos uma falha temporária ao consultar o TSE. Tentando de novo automaticamente.`
          : `A apuração de ${label} aparecerá aqui assim que o TSE publicar o pleito.`}
      </p>
      <LiveCheckBadge checkedAt={checkedAt} found={false} />
    </Card>
  );
}

function LiveCheckBadge({ checkedAt, found }: { checkedAt: Date | null; found: boolean }) {
  if (!checkedAt) return null;
  return (
    <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-border pt-4">
      <Badge variant={found ? "accent" : "neutral"}>
        <CheckCircle2 size={11} />
        Verificado com o TSE às {checkedAt.toLocaleTimeString("pt-BR")}
      </Badge>
    </div>
  );
}

function ProgressPanel({ progress, label }: { progress: import("@/integrations/tse").ElectionProgress; label: string }) {
  return (
    <Card className="mx-auto max-w-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">{label}</h3>
        {progress.stale && <Badge variant="mock">Atualização atrasada</Badge>}
      </div>
      <p className="mt-2 font-mono text-4xl font-bold text-accent-ink">{progress.percentage.toFixed(2)}%</p>
      <p className="text-sm text-text-muted">das seções apuradas</p>
      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <Stat label="Comparecimento" value={progress.turnoutPercentage != null ? `${progress.turnoutPercentage.toFixed(1)}%` : "—"} />
        <Stat label="Abstenção" value={progress.abstentionPercentage != null ? `${progress.abstentionPercentage.toFixed(1)}%` : "—"} />
        <Stat label="Brancos" value={progress.blankVotes?.toLocaleString("pt-BR") ?? "—"} />
        <Stat label="Nulos" value={progress.nullVotes?.toLocaleString("pt-BR") ?? "—"} />
      </dl>
      <LiveCheckBadge checkedAt={progress.updatedAt} found />
    </Card>
  );
}

function OfficeResultsPanel({ result, label }: { result: import("@/integrations/tse").OfficeResult; label: string }) {
  return (
    <Card className="mx-auto max-w-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">{label}</h3>
        {result.stale && <Badge variant="mock">Atualização atrasada</Badge>}
      </div>
      {result.seats > 1 && <p className="mt-1 font-mono text-xs text-accent-ink">{result.seats} VAGAS</p>}
      <p className="mt-2 font-mono text-sm text-taupe-ink">{result.totalizationPercentage.toFixed(2)}% das seções apuradas</p>
      <ul className="mt-4 flex flex-col gap-2">
        {result.candidates.map((c) => (
          <li key={c.candidateId} className="flex items-center gap-3 rounded-xl border border-border p-3">
            <UserRound size={18} className="flex-none text-taupe" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{c.ballotName}</p>
              <p className="text-xs text-text-muted">{c.party}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-bold">{c.percentage.toFixed(2)}%</p>
              <Badge variant={c.isElected ? "accent" : "neutral"}>{c.officialStatus}</Badge>
            </div>
          </li>
        ))}
      </ul>
      <LiveCheckBadge checkedAt={result.updatedAt} found />
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-2xl font-bold tabular-nums">{value}</dt>
      <dd className="text-xs text-text-muted">{label}</dd>
    </div>
  );
}
