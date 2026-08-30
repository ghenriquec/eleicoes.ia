/**
 * Cargos das Eleições Gerais 2026 e a ordem de votação na urna (briefing §3).
 * No 1º turno o eleitor faz 6 escolhas, nessa ordem exata.
 */
export type OfficeSlug =
  | "deputado-federal"
  | "deputado-estadual"
  | "deputado-distrital"
  | "senador"
  | "governador"
  | "presidente";

export interface OfficeInfo {
  slug: OfficeSlug;
  name: string;
  namePlural: string;
  short: string;
  /** Ordem de votação na urna no 1º turno (briefing §3). */
  ballotOrder: number;
  /** Cargo proporcional (mais votado dentro do partido/coligação pode não se eleger) ou majoritário. */
  kind: "proporcional" | "majoritario";
  /** Escopo territorial do cargo. */
  scope: "estadual" | "distrital" | "nacional";
  /** Quantas vagas o eleitor escolhe para este cargo na urna. */
  seatsChosenByVoter: number;
  /** Pode haver 2º turno para este cargo. */
  hasSecondRound: boolean;
  description: string;
}

export const OFFICES: readonly OfficeInfo[] = [
  {
    slug: "deputado-federal",
    name: "Deputado Federal",
    namePlural: "Deputados Federais",
    short: "Dep. Federal",
    ballotOrder: 1,
    kind: "proporcional",
    scope: "estadual",
    seatsChosenByVoter: 1,
    hasSecondRound: false,
    description:
      "Compõe a Câmara dos Deputados em Brasília, representando o estado (ou o DF) na União. Vota leis federais, orçamento e fiscaliza o governo federal.",
  },
  {
    slug: "deputado-estadual",
    name: "Deputado Estadual",
    namePlural: "Deputados Estaduais",
    short: "Dep. Estadual",
    ballotOrder: 2,
    kind: "proporcional",
    scope: "estadual",
    seatsChosenByVoter: 1,
    hasSecondRound: false,
    description:
      "Compõe a Assembleia Legislativa do estado. Vota leis estaduais e fiscaliza o governo estadual. Em todo o Brasil, exceto no Distrito Federal.",
  },
  {
    slug: "deputado-distrital",
    name: "Deputado Distrital",
    namePlural: "Deputados Distritais",
    short: "Dep. Distrital",
    ballotOrder: 2,
    kind: "proporcional",
    scope: "distrital",
    seatsChosenByVoter: 1,
    hasSecondRound: false,
    description:
      "Equivalente a Deputado Estadual, mas exclusivo do Distrito Federal — compõe a Câmara Legislativa do DF.",
  },
  {
    slug: "senador",
    name: "Senador",
    namePlural: "Senadores",
    short: "Senador",
    ballotOrder: 3,
    kind: "majoritario",
    scope: "estadual",
    seatsChosenByVoter: 2,
    hasSecondRound: false,
    description:
      "Compõe o Senado Federal. Em 2026 cada estado e o DF elegem 2 senadores (renovação de 2/3 da casa). O eleitor escolhe dois nomes distintos, em votos separados na urna.",
  },
  {
    slug: "governador",
    name: "Governador",
    namePlural: "Governadores",
    short: "Governador",
    ballotOrder: 5,
    kind: "majoritario",
    scope: "estadual",
    seatsChosenByVoter: 1,
    hasSecondRound: true,
    description:
      "Chefe do Poder Executivo estadual (ou distrital). Pode haver 2º turno se nenhum candidato passar de 50% dos votos válidos no 1º turno.",
  },
  {
    slug: "presidente",
    name: "Presidente da República",
    namePlural: "Presidente da República",
    short: "Presidente",
    ballotOrder: 6,
    kind: "majoritario",
    scope: "nacional",
    seatsChosenByVoter: 1,
    hasSecondRound: true,
    description:
      "Chefe do Poder Executivo federal. Eleição nacional, mesma chapa em todo o país. Pode haver 2º turno se nenhum candidato passar de 50% dos votos válidos no 1º turno.",
  },
] as const;

const OFFICE_BY_SLUG = new Map(OFFICES.map((o) => [o.slug, o]));

export function getOffice(slug: string): OfficeInfo | undefined {
  return OFFICE_BY_SLUG.get(slug as OfficeSlug);
}

/** Ordem de votação da urna no 1º turno (briefing §3), com nota sobre o Senado. */
export const BALLOT_ORDER: readonly OfficeSlug[] = [
  "deputado-federal",
  "deputado-estadual", // DF usa "deputado-distrital" no mesmo passo
  "senador", // 1ª vaga
  "senador", // 2ª vaga
  "governador",
  "presidente",
];

/**
 * Retorna os cargos da cola eleitoral para uma UF, na ordem correta da urna.
 * DF substitui Deputado Estadual por Deputado Distrital (briefing §3).
 */
export function ballotOfficesForUF(uf: string): OfficeSlug[] {
  const stateOffice: OfficeSlug = uf.toUpperCase() === "DF" ? "deputado-distrital" : "deputado-estadual";
  return ["deputado-federal", stateOffice, "senador", "senador", "governador", "presidente"];
}

/** Cargos com possibilidade de 2º turno (briefing §3: apenas majoritários nacionais/estaduais). */
export const SECOND_ROUND_OFFICES: readonly OfficeSlug[] = ["governador", "presidente"];
