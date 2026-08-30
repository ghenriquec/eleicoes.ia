import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Resultados 2026" };

export default function Resultados2026Page() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Resultados das Eleições 2026</h1>
      <Card className="mt-8">
        <p className="text-text-muted">
          O resultado final oficial ainda não foi divulgado pelo TSE. Esta página vai reunir, por Brasil, estado,
          cargo e candidato, os resultados definitivos assim que a Justiça Eleitoral encerrar a apuração.
        </p>
        <Button href="/apuracao" variant="secondary" className="mt-5">
          Acompanhar apuração
        </Button>
      </Card>
    </div>
  );
}
