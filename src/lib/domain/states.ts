/**
 * As 26 unidades da federação mais o Distrito Federal.
 * Nunca hardcode regras eleitorais de um estado específico como regra nacional (briefing §80).
 */
export interface StateInfo {
  uf: string;
  name: string;
  capital: string;
  region: "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul";
}

export const STATES: readonly StateInfo[] = [
  { uf: "AC", name: "Acre", capital: "Rio Branco", region: "Norte" },
  { uf: "AL", name: "Alagoas", capital: "Maceió", region: "Nordeste" },
  { uf: "AP", name: "Amapá", capital: "Macapá", region: "Norte" },
  { uf: "AM", name: "Amazonas", capital: "Manaus", region: "Norte" },
  { uf: "BA", name: "Bahia", capital: "Salvador", region: "Nordeste" },
  { uf: "CE", name: "Ceará", capital: "Fortaleza", region: "Nordeste" },
  { uf: "DF", name: "Distrito Federal", capital: "Brasília", region: "Centro-Oeste" },
  { uf: "ES", name: "Espírito Santo", capital: "Vitória", region: "Sudeste" },
  { uf: "GO", name: "Goiás", capital: "Goiânia", region: "Centro-Oeste" },
  { uf: "MA", name: "Maranhão", capital: "São Luís", region: "Nordeste" },
  { uf: "MT", name: "Mato Grosso", capital: "Cuiabá", region: "Centro-Oeste" },
  { uf: "MS", name: "Mato Grosso do Sul", capital: "Campo Grande", region: "Centro-Oeste" },
  { uf: "MG", name: "Minas Gerais", capital: "Belo Horizonte", region: "Sudeste" },
  { uf: "PA", name: "Pará", capital: "Belém", region: "Norte" },
  { uf: "PB", name: "Paraíba", capital: "João Pessoa", region: "Nordeste" },
  { uf: "PR", name: "Paraná", capital: "Curitiba", region: "Sul" },
  { uf: "PE", name: "Pernambuco", capital: "Recife", region: "Nordeste" },
  { uf: "PI", name: "Piauí", capital: "Teresina", region: "Nordeste" },
  { uf: "RJ", name: "Rio de Janeiro", capital: "Rio de Janeiro", region: "Sudeste" },
  { uf: "RN", name: "Rio Grande do Norte", capital: "Natal", region: "Nordeste" },
  { uf: "RS", name: "Rio Grande do Sul", capital: "Porto Alegre", region: "Sul" },
  { uf: "RO", name: "Rondônia", capital: "Porto Velho", region: "Norte" },
  { uf: "RR", name: "Roraima", capital: "Boa Vista", region: "Norte" },
  { uf: "SC", name: "Santa Catarina", capital: "Florianópolis", region: "Sul" },
  { uf: "SP", name: "São Paulo", capital: "São Paulo", region: "Sudeste" },
  { uf: "SE", name: "Sergipe", capital: "Aracaju", region: "Nordeste" },
  { uf: "TO", name: "Tocantins", capital: "Palmas", region: "Norte" },
] as const;

export type UF = (typeof STATES)[number]["uf"];

const STATE_BY_UF = new Map(STATES.map((s) => [s.uf, s]));

export function getState(uf: string): StateInfo | undefined {
  return STATE_BY_UF.get(uf.toUpperCase());
}

export function isValidUF(uf: string): uf is UF {
  return STATE_BY_UF.has(uf.toUpperCase());
}
