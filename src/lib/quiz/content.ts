/**
 * Conteúdo do quiz (briefing §19-21). Vive em código (não só no banco) para
 * que o seed e os testes de domínio compartilhem a mesma fonte — o seed grava
 * estas perguntas nas tabelas Topic/QuizQuestion/QuizAnswerOption.
 *
 * Nunca perguntas partidárias — sempre posições concretas, sempre com opção
 * "não sei / prefiro não responder" (normalizedPosition: null).
 */

export interface TopicSeed {
  slug: string;
  name: string;
}

export interface QuestionSeed {
  topicSlug: string;
  text: string;
  explanation?: string;
  options: { text: string; normalizedPosition: number | null }[];
}

export const TOPICS: TopicSeed[] = [
  { slug: "economia", name: "Economia e emprego" },
  { slug: "saude", name: "Saúde" },
  { slug: "educacao", name: "Educação" },
  { slug: "seguranca", name: "Segurança pública" },
  { slug: "corrupcao", name: "Combate à corrupção" },
  { slug: "meio-ambiente", name: "Meio ambiente" },
  { slug: "impostos", name: "Impostos" },
  { slug: "empreendedorismo", name: "Empreendedorismo" },
  { slug: "agricultura", name: "Agricultura" },
  { slug: "habitacao", name: "Habitação" },
  { slug: "infraestrutura", name: "Infraestrutura e mobilidade" },
  { slug: "politicas-sociais", name: "Políticas sociais" },
  { slug: "tecnologia", name: "Tecnologia" },
  { slug: "direitos-individuais", name: "Direitos individuais" },
  { slug: "administracao-publica", name: "Administração pública" },
];

const NAO_SEI = { text: "Não sei / prefiro não responder", normalizedPosition: null };

export const QUESTIONS: QuestionSeed[] = [
  {
    topicSlug: "economia",
    text: "Sobre o papel do Estado na economia, com qual posição você mais concorda?",
    explanation: "Compara preferência por intervenção estatal direta versus incentivo à iniciativa privada.",
    options: [
      { text: "O Estado deve investir diretamente em setores estratégicos e criar empregos públicos", normalizedPosition: -2 },
      { text: "O Estado deve regular mercados, mas deixar a produção para o setor privado", normalizedPosition: -1 },
      { text: "O Estado deve reduzir sua presença econômica e priorizar a iniciativa privada", normalizedPosition: 1 },
      { text: "O Estado deve minimizar ao máximo sua intervenção na economia", normalizedPosition: 2 },
      NAO_SEI,
    ],
  },
  {
    topicSlug: "impostos",
    text: "Sobre a reforma tributária, com qual posição você mais concorda?",
    options: [
      { text: "Impostos devem aumentar para quem ganha mais, para financiar serviços públicos", normalizedPosition: -2 },
      { text: "A carga tributária deve ser simplificada, mantendo a arrecadação atual", normalizedPosition: 0 },
      { text: "A carga tributária total deve ser reduzida, mesmo que isso limite gastos públicos", normalizedPosition: 2 },
      NAO_SEI,
    ],
  },
  {
    topicSlug: "saude",
    text: "Sobre o sistema de saúde, com qual posição você mais concorda?",
    options: [
      { text: "Prioridade máxima para ampliar e fortalecer o SUS com mais investimento público", normalizedPosition: -2 },
      { text: "Manter o SUS, mas ampliar parcerias com a rede privada para reduzir filas", normalizedPosition: -1 },
      { text: "Incentivar planos de saúde privados como alternativa principal de acesso", normalizedPosition: 1 },
      NAO_SEI,
    ],
  },
  {
    topicSlug: "educacao",
    text: "Sobre educação, com qual posição você mais concorda?",
    options: [
      { text: "Investimento público em escolas e universidades deve aumentar significativamente", normalizedPosition: -2 },
      { text: "O foco deve ser melhorar a gestão das escolas públicas existentes", normalizedPosition: -1 },
      { text: "Vouchers ou bolsas para escolas privadas ampliam o acesso à educação de qualidade", normalizedPosition: 1 },
      NAO_SEI,
    ],
  },
  {
    topicSlug: "seguranca",
    text: "Sobre segurança pública, com qual posição você mais concorda?",
    options: [
      { text: "Prevenção social (educação, emprego, oportunidades) reduz mais a criminalidade que repressão", normalizedPosition: -2 },
      { text: "É preciso equilibrar prevenção social e fortalecimento das polícias", normalizedPosition: 0 },
      { text: "Penas mais duras e mais efetivo policial são o caminho mais eficaz", normalizedPosition: 2 },
      NAO_SEI,
    ],
  },
  {
    topicSlug: "corrupcao",
    text: "Sobre combate à corrupção, com qual posição você mais concorda?",
    options: [
      { text: "É preciso fortalecer órgãos de controle (CGU, TCU, Ministério Público) com mais recursos", normalizedPosition: -1 },
      { text: "A prioridade deve ser simplificar processos públicos para reduzir oportunidades de desvio", normalizedPosition: 1 },
      { text: "Penas mais severas para corrupção devem ser a prioridade legislativa", normalizedPosition: 2 },
      NAO_SEI,
    ],
  },
  {
    topicSlug: "meio-ambiente",
    text: "Sobre meio ambiente, com qual posição você mais concorda?",
    options: [
      { text: "Regras ambientais devem ser mais rígidas, mesmo limitando setores produtivos", normalizedPosition: -2 },
      { text: "É preciso equilibrar desenvolvimento econômico e proteção ambiental", normalizedPosition: 0 },
      { text: "O desenvolvimento econômico deve vir antes de restrições ambientais adicionais", normalizedPosition: 2 },
      NAO_SEI,
    ],
  },
  {
    topicSlug: "empreendedorismo",
    text: "Sobre pequenos negócios, com qual posição você mais concorda?",
    options: [
      { text: "O Estado deve oferecer crédito subsidiado e programas específicos para pequenos negócios", normalizedPosition: -1 },
      { text: "A prioridade deve ser reduzir burocracia e impostos para abrir e manter empresas", normalizedPosition: 2 },
      NAO_SEI,
    ],
  },
  {
    topicSlug: "agricultura",
    text: "Sobre agropecuária, com qual posição você mais concorda?",
    options: [
      { text: "Prioridade para agricultura familiar e assistência técnica rural", normalizedPosition: -2 },
      { text: "Equilíbrio entre agricultura familiar e agronegócio de larga escala", normalizedPosition: 0 },
      { text: "Prioridade para o agronegócio de exportação como motor econômico", normalizedPosition: 2 },
      NAO_SEI,
    ],
  },
  {
    topicSlug: "habitacao",
    text: "Sobre moradia, com qual posição você mais concorda?",
    options: [
      { text: "Ampliar programas públicos de habitação popular com subsídio direto", normalizedPosition: -2 },
      { text: "Facilitar crédito imobiliário privado como principal via de acesso à moradia", normalizedPosition: 1 },
      NAO_SEI,
    ],
  },
  {
    topicSlug: "infraestrutura",
    text: "Sobre infraestrutura e mobilidade, com qual posição você mais concorda?",
    options: [
      { text: "Prioridade para transporte público e mobilidade ativa (ônibus, trilhos, ciclovias)", normalizedPosition: -1 },
      { text: "Prioridade para expansão e manutenção de rodovias", normalizedPosition: 1 },
      NAO_SEI,
    ],
  },
  {
    topicSlug: "politicas-sociais",
    text: "Sobre programas de transferência de renda, com qual posição você mais concorda?",
    options: [
      { text: "Devem ser ampliados e ter valores maiores, como política permanente", normalizedPosition: -2 },
      { text: "Devem existir, mas com contrapartidas mais rígidas (trabalho, capacitação)", normalizedPosition: 0 },
      { text: "Devem ser reduzidos e substituídos por geração de emprego formal", normalizedPosition: 2 },
      NAO_SEI,
    ],
  },
  {
    topicSlug: "tecnologia",
    text: "Sobre regulação de tecnologia e redes sociais, com qual posição você mais concorda?",
    options: [
      { text: "O Estado deve regular fortemente plataformas digitais e uso de dados", normalizedPosition: -2 },
      { text: "Regulação mínima, com foco em liberdade de inovação", normalizedPosition: 2 },
      NAO_SEI,
    ],
  },
  {
    topicSlug: "direitos-individuais",
    text: "Sobre pautas de costumes (união homoafetiva, drogas, aborto), com qual posição você mais concorda?",
    options: [
      { text: "Essas pautas devem avançar na legislação, ampliando direitos individuais", normalizedPosition: -2 },
      { text: "O tema deve ser decidido por plebiscito ou referendo popular", normalizedPosition: 0 },
      { text: "A legislação atual não deve avançar nessas pautas", normalizedPosition: 2 },
      NAO_SEI,
    ],
  },
  {
    topicSlug: "administracao-publica",
    text: "Sobre o funcionalismo público, com qual posição você mais concorda?",
    options: [
      { text: "O quadro de servidores públicos deve ser ampliado para melhorar serviços", normalizedPosition: -2 },
      { text: "O foco deve ser modernizar a gestão pública com a estrutura atual", normalizedPosition: 0 },
      { text: "O quadro de servidores e gastos com a máquina pública devem ser reduzidos", normalizedPosition: 2 },
      NAO_SEI,
    ],
  },
];
