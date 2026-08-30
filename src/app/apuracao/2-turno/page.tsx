import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ElectionCountdown } from "@/components/results/election-countdown";
import { ELECTION_CONFIG } from "@/lib/domain/election-config";

export const metadata: Metadata = { title: "Apuração — 2º turno" };

export default function SegundoTurnoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">2º turno — 25/10/2026</h1>
      <Card className="mx-auto mt-8 max-w-md py-10">
        <ElectionCountdown target={ELECTION_CONFIG.secondRoundDate.toISOString()} label="2º turno em" />
        <p className="mt-6 text-center text-sm text-text-muted">
          O 2º turno só existe para Presidente e para governos estaduais em que nenhum candidato passou de 50% dos
          votos válidos no 1º turno. Esta página mostrará os finalistas assim que o TSE confirmar o resultado do 1º
          turno.
        </p>
      </Card>
    </div>
  );
}
