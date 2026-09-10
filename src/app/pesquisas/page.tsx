import type { Metadata } from "next";
import { PesquisasClient } from "./pesquisas-client";
import { listLatestPolls, listPollUFs } from "@/lib/data/polls";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pesquisas",
  description: "Projeções de institutos registrados no TSE para presidente e governador, exatamente como publicadas.",
};

export default async function PesquisasPage() {
  const [polls, ufs] = await Promise.all([listLatestPolls(), listPollUFs()]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Pesquisas</h1>
      <p className="mt-2 text-text-muted">
        Números exatamente como cada instituto publicou — sem média, sem projeção nossa. Veja a metodologia em{" "}
        <a href="/metodologia" className="font-medium text-accent-ink hover:underline">
          Metodologia
        </a>
        .
      </p>
      <PesquisasClient polls={polls} ufs={ufs} />
    </div>
  );
}
