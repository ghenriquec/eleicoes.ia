import type { Metadata } from "next";
import { LiveResults } from "@/components/results/live-results";

export const metadata: Metadata = { title: "Apuração — 1º turno" };
export const dynamic = "force-dynamic";

export default function PrimeiroTurnoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">1º turno — 04/10/2026</h1>
      <div className="mt-8">
        <LiveResults round={1} scope="BR" label="Brasil — 1º turno" />
      </div>
    </div>
  );
}
