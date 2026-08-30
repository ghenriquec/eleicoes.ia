import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getState } from "@/lib/domain/states";
import { getOffice } from "@/lib/domain/offices";
import { ELECTION_CONFIG, deriveElectionStatus } from "@/lib/domain/election-config";
import { ResultsUnavailable } from "@/components/results/results-unavailable";

export async function generateMetadata({ params }: PageProps<"/apuracao/[uf]/[cargo]">): Promise<Metadata> {
  const { uf, cargo } = await params;
  const state = getState(uf);
  const office = getOffice(cargo);
  return { title: state && office ? `${office.name} — ${state.name}` : "Apuração" };
}

export default async function ApuracaoUfCargoPage({ params }: PageProps<"/apuracao/[uf]/[cargo]">) {
  const { uf, cargo } = await params;
  const state = getState(uf);
  const office = getOffice(cargo);
  if (!state || !office) notFound();
  const status = deriveElectionStatus(new Date(), ELECTION_CONFIG);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">
        {office.name} — {state.name}
      </h1>
      {office.seatsChosenByVoter > 1 && (
        <p className="mt-1 font-mono text-sm text-accent-ink">{office.seatsChosenByVoter} VAGAS</p>
      )}
      <div className="mt-8">
        <ResultsUnavailable status={status} scope={`de ${office.name.toLowerCase()} em ${state.name}`} />
      </div>
    </div>
  );
}
