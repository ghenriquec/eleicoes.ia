import { describe, it, expect } from "vitest";
import { compareAnswer } from "./compare";

describe("compareAnswer", () => {
  it("é UNKNOWN quando o usuário respondeu 'não sei'", () => {
    expect(compareAnswer(null, { position: 2, confidence: 0.9, sourceExcerpt: "trecho" })).toBe("UNKNOWN");
  });

  it("é UNKNOWN quando o candidato não tem posição documentada", () => {
    expect(compareAnswer(1, null)).toBe("UNKNOWN");
  });

  it("é UNKNOWN quando não há fonte, mesmo com posição preenchida (briefing §24)", () => {
    expect(compareAnswer(1, { position: 1, confidence: 0.9, sourceExcerpt: null })).toBe("UNKNOWN");
  });

  it("é MATCH quando as posições são idênticas", () => {
    expect(compareAnswer(2, { position: 2, confidence: 0.9, sourceExcerpt: "trecho" })).toBe("MATCH");
  });

  it("é PARTIAL_MATCH quando a diferença é de 1 ponto", () => {
    expect(compareAnswer(1, { position: 2, confidence: 0.9, sourceExcerpt: "trecho" })).toBe("PARTIAL_MATCH");
  });

  it("é DIFFERENT quando a diferença é maior que 1 ponto", () => {
    expect(compareAnswer(-2, { position: 2, confidence: 0.9, sourceExcerpt: "trecho" })).toBe("DIFFERENT");
  });
});
