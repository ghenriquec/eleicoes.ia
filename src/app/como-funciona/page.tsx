import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = { title: "Como funciona" };

export default function ComoFuncionaPage() {
  return (
    <LegalPage title="Como funciona" subtitle="Um guia rápido pelas funções do votocerto.ia.">
      <p>
        O votocerto.ia acompanha você do &ldquo;não sei quem são os candidatos&rdquo; até o dia da votação e a
        apuração — sem indicar em quem votar.
      </p>

      <h2>1. Guia Eleitoral</h2>
      <p>
        Navegue por estado ou cargo e veja os dados oficiais de cada candidatura: nome de urna, número, partido,
        situação, patrimônio declarado e, quando disponível, plano de governo — tudo com a fonte visível.
      </p>

      <h2>2. Comparador</h2>
      <p>
        Selecione de 2 a 4 candidatos e compare partido, situação, patrimônio e as propostas registradas no plano
        de governo oficial, lado a lado. Nunca é uma interpretação nossa do que o candidato &ldquo;quis
        dizer&rdquo; — sempre o documento original, com página e fonte visíveis.
      </p>

      <h2>3. Pesquisas</h2>
      <p>
        Projeções de institutos de pesquisa (como Quaest e Datafolha) para presidente e governador, sempre com
        instituto, metodologia, data e margem de erro visíveis. Nunca é uma previsão nossa — é o número que o
        instituto publicou, do jeito que foi publicado.
      </p>

      <h2>4. Cola Eleitoral</h2>
      <p>
        Escolha manualmente seus candidatos para os 6 cargos da urna (Deputado Federal, Deputado Estadual ou
        Distrital, 2 Senadores, Governador e Presidente) e gere uma cola grande e legível para levar no dia da
        votação. Tudo fica salvo só no seu aparelho.
      </p>

      <h2>5. Apuração ao vivo</h2>
      <p>
        No dia da eleição, acompanhe a totalização oficial do TSE por Brasil, estado e cargo, atualizada
        automaticamente conforme os arquivos oficiais são divulgados.
      </p>
    </LegalPage>
  );
}
