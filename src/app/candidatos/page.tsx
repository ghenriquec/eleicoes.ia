import { Suspense } from "react";
import type { Metadata } from "next";
import { CandidateFilters } from "@/components/candidate/candidate-filters";
import { CandidateCard } from "@/components/candidate/candidate-card";
import { listCandidates, countCandidates, listPartyAcronyms } from "@/lib/data/candidates";

export const metadata: Metadata = { title: "Candidatos" };
export const dynamic = "force-dynamic";

export default async function CandidatosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = {
    uf: typeof sp.uf === "string" ? sp.uf : undefined,
    officeSlug: typeof sp.cargo === "string" ? sp.cargo : undefined,
    partyAcronym: typeof sp.partido === "string" ? sp.partido : undefined,
    query: typeof sp.q === "string" ? sp.q : undefined,
    sort: (typeof sp.sort === "string" ? sp.sort : "az") as "az" | "za" | "numero" | "partido",
  };

  const [candidates, total, parties] = await Promise.all([
    listCandidates(filters, 60),
    countCandidates(filters),
    listPartyAcronyms(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">Candidatos</h1>
      <p className="mt-1 text-text-muted">{total} candidatos encontrados.</p>

      <div className="sticky top-[57px] z-20 -mx-4 mt-6 border-b border-border bg-bg/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-5">
        <Suspense fallback={null}>
          <CandidateFilters parties={parties} />
        </Suspense>
      </div>

      {candidates.length === 0 ? (
        <p className="mt-12 text-center text-text-muted">
          Nenhum candidato encontrado com esses filtros. Tente ajustar a busca.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((c) => (
            <CandidateCard key={c.id} candidate={c} />
          ))}
        </div>
      )}
    </div>
  );
}
