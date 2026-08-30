import { notFound } from "next/navigation";
import Link from "next/link";
import { getState } from "@/lib/domain/states";
import { getOffice, type OfficeSlug } from "@/lib/domain/offices";
import { listCandidates } from "@/lib/data/candidates";
import { CandidateCard } from "@/components/candidate/candidate-card";

export async function StateOfficeListing({ uf, officeSlug }: { uf: string; officeSlug: OfficeSlug }) {
  const state = getState(uf);
  const office = getOffice(officeSlug);
  if (!state || !office) notFound();

  const candidates = await listCandidates({ uf: state.uf, officeSlug: office.slug });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-sm text-taupe-ink">
        <Link href={`/estados/${state.uf.toLowerCase()}`} className="hover:underline">
          {state.name}
        </Link>
        {" / "}
        {office.name}
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold">
        Candidatos a {office.name} — {state.name} 2026
      </h1>
      <p className="mt-2 text-text-muted">{candidates.length} candidatos registrados.</p>

      <div className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {candidates.map((c) => (
          <CandidateCard key={c.id} candidate={c} />
        ))}
      </div>
    </div>
  );
}
