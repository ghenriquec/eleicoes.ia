import { describe, it, expect } from "vitest";
import { deriveElectionStatus, ELECTION_CONFIG } from "./election-config";

describe("deriveElectionStatus", () => {
  it("é PRE_ELECTION antes do 1º turno", () => {
    expect(deriveElectionStatus(new Date("2026-08-30T12:00:00-03:00"))).toBe("PRE_ELECTION");
  });

  it("é ELECTION_DAY durante a votação do 1º turno (08h-17h)", () => {
    expect(deriveElectionStatus(new Date("2026-10-04T12:00:00-03:00"))).toBe("ELECTION_DAY");
  });

  it("é COUNTING logo após o encerramento do 1º turno", () => {
    expect(deriveElectionStatus(new Date("2026-10-04T18:00:00-03:00"))).toBe("COUNTING");
  });

  it("é SECOND_ROUND_PREPARATION entre a apuração do 1º turno e a véspera do 2º turno", () => {
    expect(deriveElectionStatus(new Date("2026-10-15T12:00:00-03:00"))).toBe("SECOND_ROUND_PREPARATION");
  });

  it("é ELECTION_DAY durante a votação do 2º turno", () => {
    expect(deriveElectionStatus(new Date("2026-10-25T12:00:00-03:00"))).toBe("ELECTION_DAY");
  });

  it("é SECOND_ROUND_COUNTING após o encerramento do 2º turno", () => {
    expect(deriveElectionStatus(new Date("2026-10-25T18:00:00-03:00"))).toBe("SECOND_ROUND_COUNTING");
  });

  it("usa as datas oficiais de 2026: 04/10 e 25/10", () => {
    expect(ELECTION_CONFIG.firstRoundDate.getUTCMonth()).toBe(9); // outubro
    expect(ELECTION_CONFIG.firstRoundDate.getUTCDate()).toBe(4);
    expect(ELECTION_CONFIG.secondRoundDate.getUTCDate()).toBe(25);
  });
});
