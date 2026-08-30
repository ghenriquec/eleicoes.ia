import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { OFFICES, getOffice } from "@/lib/domain/offices";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return OFFICES.map((o) => ({ cargo: o.slug }));
}

export async function generateMetadata({ params }: PageProps<"/cargos/[cargo]">): Promise<Metadata> {
  const { cargo } = await params;
  const office = getOffice(cargo);
  return { title: office ? office.name : "Cargo" };
}

export default async function CargoPage({ params }: PageProps<"/cargos/[cargo]">) {
  const { cargo } = await params;
  const office = getOffice(cargo);
  if (!office) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <span className="font-mono text-xs uppercase tracking-wide text-taupe-ink">
        {office.scope === "nacional" ? "Cargo nacional" : office.scope === "distrital" ? "Cargo distrital" : "Cargo estadual"}
      </span>
      <h1 className="mt-1 font-display text-3xl font-semibold">{office.name}</h1>
      <p className="mt-4 text-lg text-text-muted">{office.description}</p>

      <Card className="mt-8">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-mono text-[11px] uppercase text-taupe-ink">Tipo de eleição</dt>
            <dd className="mt-1 font-medium">{office.kind === "majoritario" ? "Majoritária" : "Proporcional"}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase text-taupe-ink">Vagas por voto</dt>
            <dd className="mt-1 font-medium">{office.seatsChosenByVoter}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase text-taupe-ink">Ordem na urna</dt>
            <dd className="mt-1 font-medium">{office.ballotOrder}ª escolha</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase text-taupe-ink">Pode ter 2º turno?</dt>
            <dd className="mt-1 font-medium">{office.hasSecondRound ? "Sim" : "Não"}</dd>
          </div>
        </dl>
      </Card>

      <Button href={`/candidatos?cargo=${office.slug}`} className="mt-6">
        Ver candidatos a {office.name}
      </Button>
    </div>
  );
}
