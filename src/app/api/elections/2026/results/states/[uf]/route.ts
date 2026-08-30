import { getTseElectionDataProvider } from "@/integrations/tse";
import { tseJson, tseErrorResponse } from "@/integrations/tse/http-response";

export async function GET(request: Request, { params }: RouteContext<"/api/elections/2026/results/states/[uf]">) {
  const { uf } = await params;
  const round = Number(new URL(request.url).searchParams.get("round") ?? "1");
  try {
    const tse = getTseElectionDataProvider();
    const progress = await tse.results.getStateProgress(uf, round);
    return tseJson(progress, { updatedAt: progress.updatedAt, stale: progress.stale });
  } catch (err) {
    return tseErrorResponse(err);
  }
}
