import type { Metadata } from "next";
import { getState } from "@/lib/domain/states";
import { StateOfficeListing } from "@/components/candidate/state-office-listing";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/estados/[uf]/deputado-estadual">): Promise<Metadata> {
  const { uf } = await params;
  const state = getState(uf);
  return { title: state ? `Candidatos a Deputado Estadual — ${state.name} 2026` : "Deputado Estadual" };
}

/** DF não tem Deputado Estadual — ver /estados/[uf]/deputado-distrital. */
export default async function DeputadoEstadualPage({ params }: PageProps<"/estados/[uf]/deputado-estadual">) {
  const { uf } = await params;
  return <StateOfficeListing uf={uf} officeSlug="deputado-estadual" />;
}
