import { describe, it, expect } from "vitest";
import { ballotSlotsForUF, validateBallotSelection, ballotProgress, isBallotComplete, type Ballot, type BallotCandidateRef } from "./ballot";

function candidate(overrides: Partial<BallotCandidateRef> = {}): BallotCandidateRef {
  return {
    candidateId: "c1",
    ballotNumber: "13",
    ballotName: "Fulano de Tal",
    office: "senador",
    uf: "MG",
    photoUrl: null,
    partyAcronym: "EXP",
    statusAtSelection: "DEFERIDA",
    ...overrides,
  };
}

describe("ballotSlotsForUF", () => {
  it("usa Deputado Estadual para estados comuns", () => {
    const slots = ballotSlotsForUF("MG");
    expect(slots.find((s) => s.key === "deputado-estadual-distrital")?.office).toBe("deputado-estadual");
  });

  it("usa Deputado Distrital para o Distrito Federal (briefing §3)", () => {
    const slots = ballotSlotsForUF("DF");
    expect(slots.find((s) => s.key === "deputado-estadual-distrital")?.office).toBe("deputado-distrital");
  });

  it("sempre tem 6 slots, na ordem da urna", () => {
    const slots = ballotSlotsForUF("SP");
    expect(slots.map((s) => s.key)).toEqual([
      "deputado-federal",
      "deputado-estadual-distrital",
      "senador-1",
      "senador-2",
      "governador",
      "presidente",
    ]);
  });
});

describe("validateBallotSelection", () => {
  it("rejeita candidato de cargo errado", () => {
    const ballot: Ballot = {};
    const err = validateBallotSelection(ballot, "governador", candidate({ office: "senador" }), "MG");
    expect(err?.code).toBe("WRONG_OFFICE");
  });

  it("rejeita candidato de UF errada para cargo estadual", () => {
    const ballot: Ballot = {};
    const err = validateBallotSelection(ballot, "governador", candidate({ office: "governador", uf: "SP" }), "MG");
    expect(err?.code).toBe("WRONG_UF");
  });

  it("aceita presidente de qualquer UF (cargo nacional)", () => {
    const ballot: Ballot = {};
    const err = validateBallotSelection(ballot, "presidente", candidate({ office: "presidente", uf: "BR" }), "MG");
    expect(err).toBeNull();
  });

  it("nunca permite o mesmo candidato nas duas vagas de Senador", () => {
    const ballot: Ballot = {
      "senador-1": candidate({ candidateId: "same", office: "senador" }),
    };
    const err = validateBallotSelection(ballot, "senador-2", candidate({ candidateId: "same", office: "senador" }), "MG");
    expect(err?.code).toBe("DUPLICATE_SENATOR");
  });

  it("permite dois senadores distintos", () => {
    const ballot: Ballot = {
      "senador-1": candidate({ candidateId: "a", office: "senador" }),
    };
    const err = validateBallotSelection(ballot, "senador-2", candidate({ candidateId: "b", office: "senador" }), "MG");
    expect(err).toBeNull();
  });
});

describe("ballotProgress / isBallotComplete", () => {
  it("conta escolhas preenchidas corretamente", () => {
    const ballot: Ballot = {
      "senador-1": candidate({ candidateId: "a" }),
      governador: candidate({ candidateId: "b", office: "governador" }),
    };
    expect(ballotProgress(ballot, "MG")).toEqual({ filled: 2, total: 6 });
    expect(isBallotComplete(ballot, "MG")).toBe(false);
  });

  it("reconhece cola completa com os 6 cargos", () => {
    const ballot: Ballot = {
      "deputado-federal": candidate({ office: "deputado-federal" }),
      "deputado-estadual-distrital": candidate({ office: "deputado-estadual" }),
      "senador-1": candidate({ candidateId: "a", office: "senador" }),
      "senador-2": candidate({ candidateId: "b", office: "senador" }),
      governador: candidate({ office: "governador" }),
      presidente: candidate({ office: "presidente", uf: "BR" }),
    };
    expect(isBallotComplete(ballot, "MG")).toBe(true);
  });
});
