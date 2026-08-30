import type { Metadata } from "next";
import { CandidateComparison } from "@/components/candidate/candidate-comparison";

export const metadata: Metadata = { title: "Comparar candidatos" };

export default function CompararPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Comparar candidatos</h1>
      <p className="mt-2 text-text-muted">
        Escolha estado, cargo e de 2 a 4 candidatos para comparar lado a lado. Nenhum candidato é declarado vencedor.
      </p>
      <div className="mt-6">
        <CandidateComparison />
      </div>
    </div>
  );
}
