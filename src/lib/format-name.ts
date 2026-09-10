/**
 * O TSE armazena nomes em CAIXA ALTA (é o valor oficial — nunca alteramos o
 * dado salvo, só a exibição). Title Case em pt-BR: mantém preposições e
 * artigos comuns em minúsculo quando não são a primeira palavra.
 */
const LOWERCASE_WORDS = new Set(["de", "da", "do", "das", "dos", "e", "em"]);

export function formatBallotName(name: string): string {
  if (!name) return name;
  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, i) => {
      if (i > 0 && LOWERCASE_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
