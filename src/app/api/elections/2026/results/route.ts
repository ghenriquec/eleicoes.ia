import { getTseElectionDataProvider } from "@/integrations/tse";
import { tseJson, tseErrorResponse } from "@/integrations/tse/http-response";

/** GET /api/elections/2026/results — visão geral nacional (1º turno). */
export async function GET() {
  try {
    const tse = getTseElectionDataProvider();
    const [config, progress] = await Promise.all([
      tse.results.getElectionConfiguration(1),
      tse.results.getBrazilProgress(1),
    ]);
    return tseJson({ config, progress }, { updatedAt: progress.updatedAt, stale: progress.stale });
  } catch (err) {
    return tseErrorResponse(err);
  }
}
