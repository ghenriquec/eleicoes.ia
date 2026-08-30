/**
 * Dados de EXEMPLO para desenvolvimento local. Nada aqui é um candidato real —
 * partidos, nomes, números e propostas são fictícios por construção (briefing §83).
 * Todo registro nasce com `isMockData: true` e a interface exibe um selo
 * "DADOS DE EXEMPLO" sempre que este conjunto está em uso (ver ENV RESULTS_MODE).
 */

export const MOCK_PARTIES = [
  { tseNumber: 10, acronym: "EXP", name: "Partido Exemplo" },
  { tseNumber: 20, acronym: "MOD", name: "Partido Modelo" },
  { tseNumber: 30, acronym: "TST", name: "Partido Teste" },
  { tseNumber: 40, acronym: "AMO", name: "Partido Amostra" },
  { tseNumber: 50, acronym: "SIM", name: "Partido Simulado" },
  { tseNumber: 60, acronym: "DEM", name: "Partido Demonstração" },
] as const;

const FIRST_NAMES = [
  "Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Gabriela", "Hugo",
  "Isabela", "João", "Karina", "Lucas", "Marina", "Nelson", "Otávio", "Paula",
  "Rafael", "Sandra", "Tiago", "Vera",
];
const LAST_NAMES = [
  "Andrade", "Barros", "Cavalcante", "Duarte", "Esteves", "Farias", "Gouveia",
  "Henriques", "Itagaki", "Junqueira", "Lacerda", "Monteiro", "Nogueira",
  "Oliveira", "Pereira", "Queiroz", "Ramalho", "Siqueira", "Teixeira", "Vasconcelos",
];

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

export interface MockCandidateSeed {
  tseCandidateId: string;
  uf: string;
  officeSlug: string;
  ballotName: string;
  fullName: string;
  ballotNumber: string;
  partyIndex: number;
  status: "DEFERIDA" | "DEFERIDA COM RECURSO" | "SUB JUDICE";
  occupation: string;
  educationLevel: string;
  birthYear: number;
  hasAssets: boolean;
  hasProposal: boolean;
}

const OCCUPATIONS = ["Advogado(a)", "Empresário(a)", "Professor(a)", "Médico(a)", "Servidor(a) público(a)", "Engenheiro(a)"];
const EDUCATION = ["Ensino Médio", "Ensino Superior Incompleto", "Ensino Superior Completo", "Pós-graduação"];

export function generateMockCandidates(states: string[]): MockCandidateSeed[] {
  const out: MockCandidateSeed[] = [];
  let seed = 0;

  // Presidente — corrida nacional, gerada uma única vez.
  const presidentNumbers = ["12", "13", "22", "45"];
  for (let i = 0; i < 4; i++) {
    seed++;
    const first = pick(FIRST_NAMES, seed);
    const last = pick(LAST_NAMES, seed * 3);
    out.push({
      tseCandidateId: `MOCK-PRES-${i}`,
      uf: "BR",
      officeSlug: "presidente",
      ballotName: `${first} ${last}`,
      fullName: `${first} ${pick(FIRST_NAMES, seed * 7)} ${last}`,
      ballotNumber: presidentNumbers[i],
      partyIndex: i % MOCK_PARTIES.length,
      status: "DEFERIDA",
      occupation: pick(OCCUPATIONS, seed),
      educationLevel: "Ensino Superior Completo",
      birthYear: 1958 + i * 6,
      hasAssets: true,
      hasProposal: true,
    });
  }

  for (const uf of states) {
    const isDF = uf === "DF";
    const stateOffice = isDF ? "deputado-distrital" : "deputado-estadual";

    // Governador — 3 por estado.
    for (let i = 0; i < 3; i++) {
      seed++;
      const first = pick(FIRST_NAMES, seed);
      const last = pick(LAST_NAMES, seed * 3);
      out.push({
        tseCandidateId: `MOCK-${uf}-GOV-${i}`,
        uf,
        officeSlug: "governador",
        ballotName: `${first} ${last}`,
        fullName: `${first} ${pick(FIRST_NAMES, seed * 5)} ${last}`,
        ballotNumber: String(10 + i * 10),
        partyIndex: (seed + i) % MOCK_PARTIES.length,
        status: i === 2 ? "SUB JUDICE" : "DEFERIDA",
        occupation: pick(OCCUPATIONS, seed + i),
        educationLevel: pick(EDUCATION, seed),
        birthYear: 1965 + i * 4,
        hasAssets: true,
        hasProposal: i !== 2,
      });
    }

    // Senador — 4 por estado (para permitir escolher 2 distintos na cola).
    for (let i = 0; i < 4; i++) {
      seed++;
      const first = pick(FIRST_NAMES, seed);
      const last = pick(LAST_NAMES, seed * 3);
      out.push({
        tseCandidateId: `MOCK-${uf}-SEN-${i}`,
        uf,
        officeSlug: "senador",
        ballotName: `${first} ${last}`,
        fullName: `${first} ${pick(FIRST_NAMES, seed * 5)} ${last}`,
        ballotNumber: String(1 + i),
        partyIndex: (seed + i * 2) % MOCK_PARTIES.length,
        status: "DEFERIDA",
        occupation: pick(OCCUPATIONS, seed + i * 2),
        educationLevel: pick(EDUCATION, seed + 1),
        birthYear: 1960 + i * 5,
        hasAssets: true,
        hasProposal: i < 2,
      });
    }

    // Deputado Federal — 6 por estado.
    for (let i = 0; i < 6; i++) {
      seed++;
      const first = pick(FIRST_NAMES, seed);
      const last = pick(LAST_NAMES, seed * 3);
      out.push({
        tseCandidateId: `MOCK-${uf}-DF-${i}`,
        uf,
        officeSlug: "deputado-federal",
        ballotName: `${first} ${last}`,
        fullName: `${first} ${pick(FIRST_NAMES, seed * 5)} ${last}`,
        ballotNumber: String(1000 + i * 111),
        partyIndex: (seed + i * 3) % MOCK_PARTIES.length,
        status: "DEFERIDA",
        occupation: pick(OCCUPATIONS, seed + i),
        educationLevel: pick(EDUCATION, seed + i),
        birthYear: 1970 + i * 3,
        hasAssets: i % 2 === 0,
        hasProposal: false,
      });
    }

    // Deputado Estadual/Distrital — 6 por estado.
    for (let i = 0; i < 6; i++) {
      seed++;
      const first = pick(FIRST_NAMES, seed);
      const last = pick(LAST_NAMES, seed * 3);
      out.push({
        tseCandidateId: `MOCK-${uf}-DE-${i}`,
        uf,
        officeSlug: stateOffice,
        ballotName: `${first} ${last}`,
        fullName: `${first} ${pick(FIRST_NAMES, seed * 5)} ${last}`,
        ballotNumber: String(15000 + i * 123),
        partyIndex: (seed + i * 4) % MOCK_PARTIES.length,
        status: "DEFERIDA",
        occupation: pick(OCCUPATIONS, seed + i * 2),
        educationLevel: pick(EDUCATION, seed + i),
        birthYear: 1968 + i * 3,
        hasAssets: i % 3 === 0,
        hasProposal: false,
      });
    }
  }

  return out;
}
