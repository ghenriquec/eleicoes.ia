import { getTseElectionDataProvider } from "@/integrations/tse";
import { tseJson, tseErrorResponse } from "@/integrations/tse/http-response";

export async function GET(request: Request) {
  const round = Number(new URL(request.url).searchParams.get("round") ?? "1");
  try {
    const tse = getTseElectionDataProvider();
    const result = await tse.results.getPresidentialResults(round);
    return tseJson(result, { updatedAt: result.updatedAt, stale: result.stale });
  } catch (err) {
    return tseErrorResponse(err);
  }
}
