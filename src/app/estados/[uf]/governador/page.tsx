import type { Metadata } from "next";
import { getState } from "@/lib/domain/states";
import { StateOfficeListing } from "@/components/candidate/state-office-listing";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/estados/[uf]/governador">): Promise<Metadata> {
  const { uf } = await params;
  const state = getState(uf);
  return { title: state ? `Candidatos a Governador — ${state.name} 2026` : "Governador" };
}

export default async function GovernadorPage({ params }: PageProps<"/estados/[uf]/governador">) {
  const { uf } = await params;
  return <StateOfficeListing uf={uf} officeSlug="governador" />;
}
