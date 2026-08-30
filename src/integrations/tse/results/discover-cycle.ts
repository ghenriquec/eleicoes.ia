import { tseFetch } from "../client/http-client";
import { TSE_CONFIG } from "../config";
import { TseElectionConfigSchema, type TsePleito } from "../schemas/results.schema";
import { TseSchemaValidationError } from "../errors";

/**
 * Descobre dinamicamente o `cd_eleicao` do pleito corrente a partir de
 * `ele-c.json` — NUNCA hardcoded (docs/tse-integration.md §3: os códigos
 * 544/545/546 observados em 2022 não se repetem em 2026).
 */

const ELE_C_URL = `${TSE_CONFIG.resultsBaseUrl}/comum/config/ele-c.json`;

export interface DiscoveredCycle {
  cdEleicao: string;
  round: number;
  votingDate: string;
  name: string;
}

/** dd/mm/yyyy -> Date, sem depender de timezone do parser nativo */
function parseBrDate(dmy: string): Date {
  const [d, m, y] = dmy.split("/").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/**
 * Procura, entre os pleitos listados, um cuja data bata com o 1º ou 2º
 * turno das Eleições Gerais 2026 (04/10/2026 ou 25/10/2026), com folga de
 * 1 dia para acomodar fuso/arredondamento.
 */
export async function discoverGeneralElectionCycle(round: 1 | 2): Promise<DiscoveredCycle | null> {
  const res = await tseFetch(ELE_C_URL, { responseType: "json" });
  const parsed = TseElectionConfigSchema.safeParse(res.data);
  if (!parsed.success) {
    throw new TseSchemaValidationError("ele-c.json", parsed.error.issues);
  }

  const targetDate = round === 1 ? new Date(2026, 9, 4) : new Date(2026, 9, 25);

  const match = findPleitoNear(parsed.data.pl, targetDate, round);
  if (!match) return null;

  const election = match.pleito.e.find((e) => e.t === String(round)) ?? match.pleito.e[0];
  return {
    cdEleicao: election.cd,
    round,
    votingDate: match.pleito.dt,
    name: election.nm,
  };
}

function findPleitoNear(pleitos: TsePleito[], target: Date, round: number) {
  for (const pleito of pleitos) {
    const dt = parseBrDate(pleito.dt);
    const diffDays = Math.abs((dt.getTime() - target.getTime()) / 86_400_000);
    if (diffDays <= 1 && pleito.e.some((e) => e.t === String(round))) {
      return { pleito };
    }
  }
  return null;
}
