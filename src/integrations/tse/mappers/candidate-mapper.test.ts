import { describe, it, expect } from "vitest";
import { parseMoneyToCents } from "./candidate-mapper";

describe("parseMoneyToCents (briefing 'BENS' — nunca float para dinheiro)", () => {
  it("converte formato brasileiro '1.234,56' para 123456 centavos", () => {
    expect(parseMoneyToCents("1.234,56")).toBe(123456n);
  });

  it("converte valor simples '450000,00'", () => {
    expect(parseMoneyToCents("450000,00")).toBe(45000000n);
  });

  it("lida com valor sem centavos declarados", () => {
    expect(parseMoneyToCents("1.000")).toBe(100000n);
  });

  it("lida com zero", () => {
    expect(parseMoneyToCents("0,00")).toBe(0n);
  });

  it("preserva precisão em valores grandes onde float perderia precisão", () => {
    // 2^53 centavos ultrapassa Number.MAX_SAFE_INTEGER — prova que BigInt é necessário.
    expect(parseMoneyToCents("90071992547409,91")).toBe(9007199254740991n);
  });
});
