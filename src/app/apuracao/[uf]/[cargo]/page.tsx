import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getState } from "@/lib/domain/states";
import { getOffice } from "@/lib/domain/offices";
import { LiveResults } from "@/components/results/live-results";
import { OFFICE_SLUG_TO_ENUM } from "@/integrations/tse/constants/offices";

export const dynamic = "force-dynamic";

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
  const electionOffice = OFFICE_SLUG_TO_ENUM[office.slug];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">
        {office.name} — {state.name}
      </h1>
      {office.seatsChosenByVoter > 1 && (
        <p className="mt-1 font-mono text-sm text-accent-ink">{office.seatsChosenByVoter} VAGAS</p>
      )}
      <div className="mt-8">
        <LiveResults
          round={1}
          scope={electionOffice === "PRESIDENT" ? "BR" : state.uf}
          office={electionOffice}
          label={`${office.name} — ${state.name}`}
        />
      </div>
    </div>
  );
}
