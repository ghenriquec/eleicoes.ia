import { STATES } from "@/lib/domain/states";
import { tseJson } from "@/integrations/tse/http-response";

export async function GET() {
  return tseJson(STATES.map((s) => ({ uf: s.uf, name: s.name, capital: s.capital, region: s.region })));
}
