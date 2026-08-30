import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { TseElectionConfigSchema } from "../schemas/results.schema";

/**
 * Não testamos discoverGeneralElectionCycle() fazendo fetch de verdade
 * (contract test não deve depender de rede). Em vez disso, validamos o
 * schema contra a captura real de 30/08/2026 e documentamos o achado
 * central desta integração: nessa data, a Eleição Geral 2026 AINDA NÃO
 * estava publicada em ele-c.json (docs/tse-integration.md §3).
 */
describe("ele-c.json — captura real de 30/08/2026", () => {
  const fixture = JSON.parse(
    readFileSync(join(__dirname, "../fixtures/live-2026-08-30/ele-c-config.json"), "utf8"),
  );

  it("passa no schema de validação", () => {
    expect(() => TseElectionConfigSchema.parse(fixture)).not.toThrow();
  });

  it("ainda não lista a Eleição Geral 2026 (1º turno 04/10/2026)", () => {
    const parsed = TseElectionConfigSchema.parse(fixture);
    const hasGeneral2026 = parsed.pl.some((p) => p.dt === "04/10/2026" || p.dt === "25/10/2026");
    // Este teste documenta o estado real observado — se um dia ele passar a
    // falhar (found === true), é o sinal de que o TSE publicou o pleito e o
    // worker de apuração pode ser ativado (ver blueprint §19, pendência #2).
    expect(hasGeneral2026).toBe(false);
  });

  it("lista pleitos municipais/suplementares até meados de 2026", () => {
    const parsed = TseElectionConfigSchema.parse(fixture);
    expect(parsed.pl.length).toBeGreaterThan(30);
  });
});
