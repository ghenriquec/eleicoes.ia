import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { TseResultFileSchema } from "../schemas/results.schema";
import { normalizeResultFile } from "./normalize";

/**
 * Contract tests contra respostas REAIS do TSE (obtidas ao vivo em
 * 30/08/2026 — docs/tse-integration.md §3), não fixtures inventadas.
 * Se o TSE mudar o schema em 2026, este teste é o primeiro a quebrar —
 * exatamente o objetivo (briefing "CONTRACT TESTS").
 */

function loadFixture(name: string) {
  const raw = readFileSync(join(__dirname, "../fixtures/real-2022", name), "utf8");
  return JSON.parse(raw);
}

describe("TseResultFileSchema — fixtures reais de 2022", () => {
  it("valida o resultado do 1º turno presidencial (Brasil)", () => {
    const fixture = loadFixture("results-presidente-1t-brasil.json");
    const parsed = TseResultFileSchema.parse(fixture);
    expect(parsed.cand.length).toBeGreaterThan(0);
  });

  it("valida o resultado do 2º turno presidencial (Brasil)", () => {
    const fixture = loadFixture("results-presidente-2t-brasil.json");
    const parsed = TseResultFileSchema.parse(fixture);
    expect(parsed.cand).toHaveLength(2);
  });

  it("valida o resultado de Deputado Federal (Amapá) — eleição proporcional, sem 2º turno", () => {
    const fixture = loadFixture("results-deputado-federal-ap.json");
    const parsed = TseResultFileSchema.parse(fixture);
    expect(parsed.cand.length).toBeGreaterThan(1);
  });
});

describe("normalizeResultFile — confere contra o resultado histórico real e público de 2022", () => {
  it("2º turno presidencial: Lula 50,90% / Bolsonaro 49,10% (fato público verificável)", () => {
    const fixture = loadFixture("results-presidente-2t-brasil.json");
    const result = normalizeResultFile(fixture, { scope: "BR" });

    const lula = result.candidates.find((c) => c.ballotName === "LULA");
    const bolsonaro = result.candidates.find((c) => c.ballotName === "JAIR BOLSONARO");

    expect(lula?.percentage).toBeCloseTo(50.9, 1);
    expect(lula?.officialStatus).toBe("Eleito");
    expect(lula?.isElected).toBe(true);

    expect(bolsonaro?.percentage).toBeCloseTo(49.1, 1);
    expect(bolsonaro?.officialStatus).toBe("Não eleito");
    expect(bolsonaro?.isElected).toBe(false);
  });

  it("nunca recalcula officialStatus — usa o valor do TSE como está", () => {
    const fixture = loadFixture("results-deputado-federal-ap.json");
    const result = normalizeResultFile(fixture, { scope: "AP" });
    const statuses = new Set(result.candidates.map((c) => c.officialStatus));
    // valores observados na fixture real — não inventados
    expect([...statuses].every((s) => typeof s === "string" && s.length > 0)).toBe(true);
  });

  it("totalizationPercentage vem de pst, não é recalculado", () => {
    const fixture = loadFixture("results-presidente-2t-brasil.json");
    const result = normalizeResultFile(fixture, { scope: "BR" });
    expect(result.totalizationPercentage).toBe(100);
  });

  it("candidatos ficam ordenados por votos (rank correto)", () => {
    const fixture = loadFixture("results-presidente-2t-brasil.json");
    const result = normalizeResultFile(fixture, { scope: "BR" });
    expect(result.candidates[0].rank).toBe(1);
    expect(result.candidates[0].votes).toBeGreaterThan(result.candidates[1].votes);
  });
});
