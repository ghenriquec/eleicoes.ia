/**
 * Configuração central da eleição (briefing §2).
 * Fonte única de verdade para datas e fase da eleição — a interface inteira
 * reage a `electionStatus`, nunca a lógica de data duplicada em cada página.
 */
export type ElectionStatus =
  | "PRE_ELECTION"
  | "ELECTION_DAY"
  | "COUNTING"
  | "FINISHED"
  | "SECOND_ROUND_PREPARATION"
  | "SECOND_ROUND_COUNTING"
  | "CLOSED";

export interface ElectionConfig {
  year: number;
  firstRoundDate: Date;
  secondRoundDate: Date;
  timezone: string;
  votingStartHour: number;
  votingEndHour: number;
}

export const ELECTION_CONFIG: ElectionConfig = {
  year: 2026,
  // 08:00–17:00 horário de Brasília, primeiro domingo de outubro de 2026.
  firstRoundDate: new Date("2026-10-04T08:00:00-03:00"),
  secondRoundDate: new Date("2026-10-25T08:00:00-03:00"),
  timezone: "America/Sao_Paulo",
  votingStartHour: 8,
  votingEndHour: 17,
};

function votingWindow(day: Date, cfg: ElectionConfig) {
  const start = new Date(day);
  start.setHours(cfg.votingStartHour, 0, 0, 0);
  const end = new Date(day);
  end.setHours(cfg.votingEndHour, 0, 0, 0);
  return { start, end };
}

/**
 * Deriva o status da eleição a partir do relógio. Em produção o status real
 * (COUNTING iniciado, resultado FINISHED) é confirmado pelo backend a partir
 * dos arquivos do TSE — esta função dá o valor padrão/mais provável para
 * quando ainda não há um status vindo da API de apuração.
 */
export function deriveElectionStatus(now: Date, cfg: ElectionConfig = ELECTION_CONFIG): ElectionStatus {
  const round1 = votingWindow(cfg.firstRoundDate, cfg);
  const round2 = votingWindow(cfg.secondRoundDate, cfg);

  // Janelas de "preparação de 2º turno": entre o fim da apuração do 1º turno
  // (aprox. 48h depois, ajustado quando houver dado real) e a véspera do 2º turno.
  const secondRoundPrepStart = new Date(round1.end);
  secondRoundPrepStart.setDate(secondRoundPrepStart.getDate() + 2);

  if (now < round1.start) return "PRE_ELECTION";
  if (now >= round1.start && now <= round1.end) return "ELECTION_DAY";
  if (now > round1.end && now < secondRoundPrepStart) return "COUNTING";
  if (now >= secondRoundPrepStart && now < round2.start) return "SECOND_ROUND_PREPARATION";
  if (now >= round2.start && now <= round2.end) return "ELECTION_DAY";
  if (now > round2.end) return "SECOND_ROUND_COUNTING";
  return "FINISHED";
}

export function isLiveResultsPhase(status: ElectionStatus): boolean {
  return status === "COUNTING" || status === "SECOND_ROUND_COUNTING" || status === "ELECTION_DAY";
}
