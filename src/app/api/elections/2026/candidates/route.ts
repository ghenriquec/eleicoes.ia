import { getTseElectionDataProvider } from "@/integrations/tse";
import { parseOfficeParam } from "@/integrations/tse/office-param";
import { tseJson, tseErrorResponse } from "@/integrations/tse/http-response";
import { serializeCandidate } from "@/integrations/tse/serialize";

/**
 * GET /api/elections/2026/candidates
 * GET /api/elections/2026/candidates?state=MG
 * GET /api/elections/2026/candidates?state=MG&office=GOVERNADOR
 *
 * O frontend nunca precisa saber que isso vem de um CSV do TSE, de qual
 * dataset, ou de qualquer detalhe de schema — só o formato normalizado.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const tse = getTseElectionDataProvider();
    const candidates = await tse.candidates.find({
      electionYear: 2026,
      state: searchParams.get("state") ?? undefined,
      office: parseOfficeParam(searchParams.get("office")) ?? undefined,
      party: searchParams.get("party") ?? undefined,
      query: searchParams.get("q") ?? undefined,
    });
    return tseJson(candidates.map(serializeCandidate));
  } catch (err) {
    return tseErrorResponse(err);
  }
}
