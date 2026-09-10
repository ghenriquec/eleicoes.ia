import { describe, it, expect } from "vitest";
import { formatBallotName } from "./format-name";

describe("formatBallotName", () => {
  it("converte nome simples em Title Case", () => {
    expect(formatBallotName("LULA")).toBe("Lula");
    expect(formatBallotName("ANDRÉ MOURA")).toBe("André Moura");
  });

  it("mantém preposições em minúsculo quando não são a primeira palavra", () => {
    expect(formatBallotName("PAULINHO DA UNIÃO TUR")).toBe("Paulinho da União Tur");
    expect(formatBallotName("MARIA DOS SANTOS")).toBe("Maria dos Santos");
    expect(formatBallotName("ADAMS COLETIVO COM CURY")).toBe("Adams Coletivo Com Cury");
  });

  it("capitaliza a preposição quando ela é a primeira palavra", () => {
    expect(formatBallotName("DA SILVA")).toBe("Da Silva");
  });

  it("preserva acentuação", () => {
    expect(formatBallotName("MAÍRA DE SOUZA")).toBe("Maíra de Souza");
    expect(formatBallotName("ELISÂNGELA ARAÚJO")).toBe("Elisângela Araújo");
  });

  it("lida com string vazia sem quebrar", () => {
    expect(formatBallotName("")).toBe("");
  });
});
