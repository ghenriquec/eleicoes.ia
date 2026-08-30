import type { Metadata } from "next";
import { getState } from "@/lib/domain/states";
import { StateOfficeListing } from "@/components/candidate/state-office-listing";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/estados/[uf]/deputado-estadual">): Promise<Metadata> {
  const { uf } = await params;
  const state = getState(uf);
  const isDF = state?.uf === "DF";
  return { title: state ? `Candidatos a Deputado ${isDF ? "Distrital" : "Estadual"} — ${state.name} 2026` : "Deputado Estadual" };
}

export default async function DeputadoEstadualPage({ params }: PageProps<"/estados/[uf]/deputado-estadual">) {
  const { uf } = await params;
  const isDF = uf.toUpperCase() === "DF";
  return <StateOfficeListing uf={uf} officeSlug={isDF ? "deputado-distrital" : "deputado-estadual"} />;
}
