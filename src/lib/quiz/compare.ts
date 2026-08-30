/**
 * Lógica de comparação entre resposta do usuário e posição documentada do
 * candidato (briefing §22-24). Pura função — sem I/O — para ser testável e
 * para deixar claro que UNKNOWN nunca é preenchido por suposição.
 */
export type ComparisonResult = "MATCH" | "PARTIAL_MATCH" | "DIFFERENT" | "UNKNOWN";

export interface CandidatePositionInput {
  position: number; // -2..2
  confidence: number; // 0..1
  sourceExcerpt: string | null;
}

/**
 * `userValue` pode ser null (usuário respondeu "não sei") — nesse caso a
 * comparação não é computável e retorna UNKNOWN, mesmo que o candidato tenha
 * posição documentada, porque não há o que comparar.
 */
export function compareAnswer(userValue: number | null, candidate: CandidatePositionInput | null): ComparisonResult {
  if (userValue === null || candidate === null) return "UNKNOWN";
  // Sem fonte, nunca classificar (briefing §24: "Se não houver fonte: não classificar").
  if (!candidate.sourceExcerpt) return "UNKNOWN";

  const diff = Math.abs(userValue - candidate.position);
  if (diff === 0) return "MATCH";
  if (diff <= 1) return "PARTIAL_MATCH";
  return "DIFFERENT";
}

export const COMPARISON_LABEL: Record<ComparisonResult, string> = {
  MATCH: "Convergente",
  PARTIAL_MATCH: "Parcialmente convergente",
  DIFFERENT: "Diferente",
  UNKNOWN: "Sem informação suficiente",
};
