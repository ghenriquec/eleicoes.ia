import { ballotOfficesForUF, type OfficeSlug } from "./offices";

/**
 * Regras da Cola Eleitoral (briefing §28-29). Puramente local ao dispositivo —
 * ver src/lib/domain/privacy.ts e a página /minha-cola: isto NUNCA é enviado ao servidor.
 */

export type BallotSlotKey =
  | "deputado-federal"
  | "deputado-estadual-distrital"
  | "senador-1"
  | "senador-2"
  | "governador"
  | "presidente";

export interface BallotSlotDefinition {
  key: BallotSlotKey;
  office: OfficeSlug;
  label: string;
}

export interface BallotCandidateRef {
  candidateId: string;
  ballotNumber: string;
  ballotName: string;
  office: OfficeSlug;
  uf: string;
  photoUrl: string | null;
  partyAcronym: string | null;
  /** Status conhecido no momento em que o candidato foi adicionado à cola. */
  statusAtSelection: string | null;
}

export type Ballot = Partial<Record<BallotSlotKey, BallotCandidateRef>>;

export function ballotSlotsForUF(uf: string): BallotSlotDefinition[] {
  const [depFederal, depEstadualOuDistrital, senador1, senador2, governador, presidente] = ballotOfficesForUF(uf);
  const isDF = uf.toUpperCase() === "DF";
  return [
    { key: "deputado-federal", office: depFederal, label: "Deputado Federal" },
    {
      key: "deputado-estadual-distrital",
      office: depEstadualOuDistrital,
      label: isDF ? "Deputado Distrital" : "Deputado Estadual",
    },
    { key: "senador-1", office: senador1, label: "Senador — 1ª escolha" },
    { key: "senador-2", office: senador2, label: "Senador — 2ª escolha" },
    { key: "governador", office: governador, label: "Governador" },
    { key: "presidente", office: presidente, label: "Presidente" },
  ];
}

export interface BallotValidationError {
  slot: BallotSlotKey;
  code: "WRONG_UF" | "WRONG_OFFICE" | "DUPLICATE_SENATOR" | "CANDIDATE_NOT_FOUND";
  message: string;
}

/**
 * Valida uma escolha antes de aceitá-la na cola (briefing §29):
 * - não permite o mesmo candidato nas duas vagas de Senador
 * - não permite candidato de UF incorreta
 * - não permite candidato de cargo incorreto
 */
export function validateBallotSelection(
  ballot: Ballot,
  slot: BallotSlotKey,
  candidate: BallotCandidateRef,
  uf: string,
): BallotValidationError | null {
  const slotDef = ballotSlotsForUF(uf).find((s) => s.key === slot);
  if (!slotDef) {
    return { slot, code: "CANDIDATE_NOT_FOUND", message: "Cargo inválido para este slot da cola." };
  }

  if (candidate.office !== slotDef.office) {
    return {
      slot,
      code: "WRONG_OFFICE",
      message: `Este candidato concorre a ${candidate.office}, não a ${slotDef.office}.`,
    };
  }

  // Presidente é nacional — não exige UF de candidatura igual à UF de voto.
  if (slotDef.office !== "presidente" && candidate.uf.toUpperCase() !== uf.toUpperCase()) {
    return {
      slot,
      code: "WRONG_UF",
      message: `Este candidato concorre em ${candidate.uf}, não em ${uf}.`,
    };
  }

  if (slot === "senador-1" && ballot["senador-2"]?.candidateId === candidate.candidateId) {
    return {
      slot,
      code: "DUPLICATE_SENATOR",
      message: "Este candidato já está selecionado como a 2ª escolha para Senador.",
    };
  }
  if (slot === "senador-2" && ballot["senador-1"]?.candidateId === candidate.candidateId) {
    return {
      slot,
      code: "DUPLICATE_SENATOR",
      message: "Este candidato já está selecionado como a 1ª escolha para Senador.",
    };
  }

  return null;
}

export function ballotProgress(ballot: Ballot, uf: string): { filled: number; total: number } {
  const slots = ballotSlotsForUF(uf);
  const filled = slots.filter((s) => Boolean(ballot[s.key])).length;
  return { filled, total: slots.length };
}

export function isBallotComplete(ballot: Ballot, uf: string): boolean {
  const { filled, total } = ballotProgress(ballot, uf);
  return filled === total;
}
