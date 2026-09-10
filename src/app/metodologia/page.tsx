import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = { title: "Metodologia" };

export default function MetodologiaPage() {
  return (
    <LegalPage title="Metodologia">
      <h2>Como posições de candidatos são classificadas</h2>
      <p>
        Uma proposta exibida no comparador só existe quando há uma fonte pública verificável — o plano de governo
        registrado no TSE, com página de origem. Ela nunca é criada por suposição, inferência de partido ou de
        discurso de campanha não registrado oficialmente. Quando o documento ainda não foi processado por tema,
        mostramos o PDF oficial completo em vez de resumir sem fonte.
      </p>

      <h2>Como exibimos pesquisas eleitorais</h2>
      <p>
        Toda pesquisa mostrada em <a href="/pesquisas">Pesquisas</a> vem de um instituto registrado no TSE (ex.:
        Quaest, Datafolha, Genial/Quaest, Paraná Pesquisas) e sempre traz instituto, data de campo, tamanho da
        amostra e margem de erro — exatamente como o instituto publicou. Nunca calculamos, ajustamos ou projetamos
        um número nosso a partir de pesquisas; nunca fazemos média ou &ldquo;poll of polls&rdquo;. Se um instituto
        não publicar margem de erro ou metodologia, isso aparece como ausente, não é preenchido por suposição.
      </p>

      <h2>Como usamos IA</h2>
      <p>
        Quando ativada, a IA é usada apenas para organizar e resumir o texto de planos de governo já publicados
        oficialmente pelo TSE — nunca para gerar uma posição que não esteja sustentada pelo documento. Todo resumo
        exibe o trecho original e a página de origem, e passa por revisão antes de ser publicado.
      </p>

      <h2>Como candidatos são ordenados</h2>
      <p>
        Listagens usam ordenação neutra: alfabética, por número de urna ou por partido (presidenciáveis aparecem
        primeiro por serem a eleição nacional). Nunca ordenamos com base no perfil político do usuário nem cobramos
        para aparecer em posição de destaque.
      </p>

      <h2>Como verificamos fontes</h2>
      <p>
        Toda informação relevante guarda de onde veio: tipo de fonte, nome, URL, documento e página quando aplicável,
        e a data em que foi obtida. Veja mais em <a href="/fontes">Fontes</a>.
      </p>

      <h2>Como corrigir um erro</h2>
      <p>
        Use o formulário em <a href="/correcoes">Encontrou um erro?</a>. Toda correção passa por revisão humana antes
        de qualquer alteração — nenhum envio altera dados automaticamente.
      </p>
    </LegalPage>
  );
}
