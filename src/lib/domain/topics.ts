/**
 * Temas usados para organizar posições/propostas de candidatos (ex.: os
 * trechos extraídos do plano de governo no comparador). Vivia em
 * `lib/quiz/content.ts` antes do quiz ser removido — o quiz é que sumiu,
 * os temas continuam sendo usados pelo comparador e pelo perfil do candidato.
 */
export interface TopicSeed {
  slug: string;
  name: string;
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
