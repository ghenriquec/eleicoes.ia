import { getTseElectionDataProvider } from ".";
import { tseJson, tseErrorResponse } from "./http-response";
import type { ElectionOffice } from "./constants/offices";

export async function handleOfficeResultRequest(request: Request, uf: string, office: ElectionOffice) {
  const round = Number(new URL(request.url).searchParams.get("round") ?? "1");
  try {
    const tse = getTseElectionDataProvider();
    const result = await tse.results.getOfficeResults(uf, office, round);
    return tseJson(result, { updatedAt: result.updatedAt, stale: result.stale });
  } catch (err) {
    return tseErrorResponse(err);
  }
}
