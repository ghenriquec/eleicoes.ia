import type { Metadata } from "next";
import { getState } from "@/lib/domain/states";
import { StateOfficeListing } from "@/components/candidate/state-office-listing";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/estados/[uf]/senador">): Promise<Metadata> {
  const { uf } = await params;
  const state = getState(uf);
  return { title: state ? `Candidatos ao Senado — ${state.name} 2026` : "Senador" };
}

export default async function SenadorPage({ params }: PageProps<"/estados/[uf]/senador">) {
  const { uf } = await params;
  return <StateOfficeListing uf={uf} officeSlug="senador" />;
}
