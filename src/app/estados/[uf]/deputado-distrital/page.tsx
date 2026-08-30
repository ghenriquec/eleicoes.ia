import type { Metadata } from "next";
import { getState } from "@/lib/domain/states";
import { StateOfficeListing } from "@/components/candidate/state-office-listing";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/estados/[uf]/deputado-distrital">): Promise<Metadata> {
  const { uf } = await params;
  const state = getState(uf);
  return { title: state ? `Candidatos a Deputado Distrital — ${state.name} 2026` : "Deputado Distrital" };
}

/** Cargo exclusivo do Distrito Federal (briefing §3) — outras UFs elegem Deputado Estadual. */
export default async function DeputadoDistritalPage({ params }: PageProps<"/estados/[uf]/deputado-distrital">) {
  const { uf } = await params;
  return <StateOfficeListing uf={uf} officeSlug="deputado-distrital" />;
}
