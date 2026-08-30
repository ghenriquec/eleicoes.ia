import type { Metadata } from "next";
import { ELECTION_CONFIG, deriveElectionStatus } from "@/lib/domain/election-config";
import { ResultsUnavailable } from "@/components/results/results-unavailable";

export const metadata: Metadata = { title: "Apuração — Brasil" };

export default function ApuracaoBrasilPage() {
  const status = deriveElectionStatus(new Date(), ELECTION_CONFIG);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Presidente — Brasil</h1>
      <div className="mt-8">
        <ResultsUnavailable status={status} scope="da corrida presidencial" />
      </div>
    </div>
  );
}
