import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { CorrectionForm } from "@/components/layout/correction-form";

export const metadata: Metadata = { title: "Encontrou um erro?" };

export default function CorrecoesPage() {
  return (
    <LegalPage title="Encontrou uma informação incorreta?" subtitle="Toda correção passa por revisão humana antes de qualquer alteração.">
      <CorrectionForm />
    </LegalPage>
  );
}
