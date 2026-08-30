import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = { title: "Metodologia" };

export default function MetodologiaPage() {
  return (
    <LegalPage title="Metodologia">
      <h2>Como o quiz funciona</h2>
      <p>
        Cada pergunta oferece de 3 a 5 posições concretas e distintas sobre um tema, mais a opção &ldquo;não sei /
        prefiro não responder&rdquo;. Cada opção tem um valor de -2 a +2 numa escala normalizada. Nunca usamos
        perguntas do tipo &ldquo;você é de esquerda ou direita&rdquo; nem citamos partidos nas perguntas.
      </p>

      <h2>Como posições de candidatos são classificadas</h2>
      <p>
        Uma posição documentada de candidato (<code>CandidateTopicPosition</code>) só existe quando há uma fonte
        pública verificável — normalmente um trecho do plano de governo registrado no TSE. Ela nunca é criada por
        suposição, inferência de partido ou de discurso de campanha não registrado oficialmente.
      </p>

      <h2>Como comparamos sua resposta com a posição do candidato</h2>
      <ul>
        <li><strong>Convergente</strong> — sua resposta e a posição documentada coincidem.</li>
        <li><strong>Parcialmente convergente</strong> — posições próximas, mas não idênticas, na escala.</li>
        <li><strong>Diferente</strong> — posições distantes na escala.</li>
        <li><strong>Sem informação suficiente</strong> — você respondeu &ldquo;não sei&rdquo;, ou o candidato não tem posição documentada com fonte para essa pergunta.</li>
      </ul>

      <h2>Como usamos IA</h2>
      <p>
        Quando ativada, a IA é usada apenas para organizar e resumir o texto de planos de governo já publicados
        oficialmente pelo TSE — nunca para gerar uma posição que não esteja sustentada pelo documento. Todo resumo
        exibe o trecho original e a página de origem, e passa por revisão antes de ser publicado.
      </p>

      <h2>Como candidatos são ordenados</h2>
      <p>
        Listagens usam ordenação neutra: alfabética, por número de urna ou por partido. Nunca ordenamos com base no
        perfil político do usuário nem cobramos para aparecer em posição de destaque.
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
