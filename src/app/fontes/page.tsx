import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { TSE_CONFIG } from "@/lib/tse-client/config";

export const metadata: Metadata = { title: "Fontes" };

export default function FontesPage() {
  return (
    <LegalPage title="Fontes oficiais" subtitle="Nenhum dado de candidatura, proposta ou resultado é produzido pelo votocerto.ia.">
      <h2>Candidaturas</h2>
      <p>
        Portal de Dados Abertos do TSE, dataset{" "}
        <a href={TSE_CONFIG.candidatesDatasetUrl} target="_blank" rel="noopener">
          Candidatos 2026
        </a>
        , complementado pelo{" "}
        <a href={TSE_CONFIG.candidatesComplementaryUrl} target="_blank" rel="noopener">
          DivulgaCandContas
        </a>
        .
      </p>

      <h2>Resultados</h2>
      <p>
        Sistema de divulgação de resultados do TSE — arquivos oficiais JSON para as Eleições 2026. Ver{" "}
        <a href={TSE_CONFIG.resultsInfoUrl} target="_blank" rel="noopener">
          informações técnicas do TSE
        </a>{" "}
        e o{" "}
        <a href={TSE_CONFIG.resultsPortalUrl} target="_blank" rel="noopener">
          portal de resultados oficiais
        </a>
        .
      </p>

      <h2>Planos de governo</h2>
      <p>Documentos registrados e disponibilizados oficialmente pelo TSE junto ao registro de cada candidatura.</p>

      <h2>Patrimônio</h2>
      <p>Declarações de bens disponibilizadas pela Justiça Eleitoral, informadas pelo próprio candidato.</p>
    </LegalPage>
  );
}
