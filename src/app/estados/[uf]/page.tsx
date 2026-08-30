import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getState } from "@/lib/domain/states";
import { OFFICES } from "@/lib/domain/offices";
import { countCandidates } from "@/lib/data/candidates";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/estados/[uf]">): Promise<Metadata> {
  const { uf } = await params;
  const state = getState(uf);
  return { title: state ? `Eleições 2026 em ${state.name}` : "Estado" };
}

export default async function EstadoPage({ params }: PageProps<"/estados/[uf]">) {
  const { uf } = await params;
  const state = getState(uf);
  if (!state) notFound();

  const officesToShow = OFFICES.filter((o) =>
    state.uf === "DF" ? o.slug !== "deputado-estadual" : o.slug !== "deputado-distrital",
  );

  const counts = await Promise.all(
    officesToShow.map(async (o) => ({
      office: o,
      count: await countCandidates({ uf: state.uf, officeSlug: o.slug }),
    })),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <span className="font-mono text-xs text-taupe-ink">{state.region}</span>
      <h1 className="mt-1 font-display text-3xl font-semibold">Eleições 2026 em {state.name}</h1>
      <p className="mt-2 text-text-muted">Capital: {state.capital}</p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {counts.map(({ office, count }) => (
          <Link key={office.slug} href={`/estados/${state.uf.toLowerCase()}/${office.slug}`}>
            <Card className="h-full transition-colors hover:border-accent">
              <p className="font-display text-lg font-semibold">{office.name}</p>
              <p className="mt-1 text-sm text-text-muted">
                {count} candidato{count !== 1 ? "s" : ""}
                {office.seatsChosenByVoter > 1 ? ` · ${office.seatsChosenByVoter} vagas` : ""}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/minha-cola">Montar minha cola para {state.uf}</Button>
        <Button href={`/apuracao/${state.uf.toLowerCase()}`} variant="secondary">
          Acompanhar apuração
        </Button>
      </div>
    </div>
  );
}
