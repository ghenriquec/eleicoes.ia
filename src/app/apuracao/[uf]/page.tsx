import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getState } from "@/lib/domain/states";
import { OFFICES } from "@/lib/domain/offices";
import { LiveResults } from "@/components/results/live-results";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/apuracao/[uf]">): Promise<Metadata> {
  const { uf } = await params;
  const state = getState(uf);
  return { title: state ? `Apuração — ${state.name}` : "Apuração" };
}

export default async function ApuracaoUfPage({ params }: PageProps<"/apuracao/[uf]">) {
  const { uf } = await params;
  const state = getState(uf);
  if (!state) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">{state.name}</h1>
      <nav className="mt-3 flex flex-wrap gap-2">
        {["governador", "senador", "deputado-federal", state.uf === "DF" ? "deputado-distrital" : "deputado-estadual"].map((slug) => {
          const office = OFFICES.find((o) => o.slug === slug);
          if (!office) return null;
          return (
            <Link
              key={slug}
              href={`/apuracao/${state.uf.toLowerCase()}/${slug}`}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm hover:border-accent"
            >
              {office.name}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8">
        <LiveResults round={1} scope={state.uf} label={state.name} />
      </div>
    </div>
  );
}
