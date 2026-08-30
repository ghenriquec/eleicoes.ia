import type { Metadata } from "next";
import { LiveResults } from "@/components/results/live-results";

export const metadata: Metadata = { title: "Apuração — 2º turno" };
export const dynamic = "force-dynamic";

export default function SegundoTurnoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">2º turno — 25/10/2026</h1>
      <div className="mt-8">
        <LiveResults round={2} scope="BR" label="Brasil — 2º turno" />
      </div>
      <p className="mx-auto mt-6 max-w-md text-center text-sm text-text-muted">
        O 2º turno só existe para Presidente e para governos estaduais em que nenhum candidato passou de 50% dos
        votos válidos no 1º turno. Esta página mostrará os finalistas assim que o TSE confirmar o resultado do 1º
        turno.
      </p>
    </div>
  );
}
