import type { Metadata } from "next";
import { getState } from "@/lib/domain/states";
import { StateOfficeListing } from "@/components/candidate/state-office-listing";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/estados/[uf]/deputado-federal">): Promise<Metadata> {
  const { uf } = await params;
  const state = getState(uf);
  return { title: state ? `Candidatos a Deputado Federal — ${state.name} 2026` : "Deputado Federal" };
}

export default async function DeputadoFederalPage({ params }: PageProps<"/estados/[uf]/deputado-federal">) {
  const { uf } = await params;
  return <StateOfficeListing uf={uf} officeSlug="deputado-federal" />;
}
