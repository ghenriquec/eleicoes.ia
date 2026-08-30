import { Radio } from "lucide-react";
import { ElectionCountdown } from "./election-countdown";
import { ELECTION_CONFIG, type ElectionStatus } from "@/lib/domain/election-config";
import { Card } from "@/components/ui/card";

export function ResultsUnavailable({ status, scope }: { status: ElectionStatus; scope?: string }) {
  if (status === "PRE_ELECTION") {
    return (
      <Card className="mx-auto max-w-md py-10">
        <ElectionCountdown target={ELECTION_CONFIG.firstRoundDate.toISOString()} label="1º turno em" />
        <p className="mt-6 text-center text-sm text-text-muted">
          A apuração {scope ? `de ${scope} ` : ""}aparecerá aqui assim que os dados oficiais começarem a ser
          divulgados pelo TSE, no dia 04/10/2026 a partir das 17h.
        </p>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-md py-10 text-center">
      <Radio size={22} className="mx-auto text-taupe-ink" />
      <p className="mt-3 font-medium">Dado ainda não disponibilizado pelo TSE.</p>
      <p className="mt-1 text-sm text-text-muted">
        A apuração {scope ? `de ${scope} ` : ""}começou, mas ainda não recebemos o primeiro arquivo oficial para
        este recorte. Atualiza automaticamente assim que chegar.
      </p>
    </Card>
  );
}
