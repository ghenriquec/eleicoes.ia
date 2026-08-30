import { ElectionOffice } from "@/integrations/tse";
import { handleOfficeResultRequest } from "@/integrations/tse/office-result-handler";

/** Sempre 2 vagas em 2026 (briefing "SENADO 2026") — ver OfficeResult.seats. */
export async function GET(request: Request, { params }: RouteContext<"/api/elections/2026/results/states/[uf]/senate">) {
  const { uf } = await params;
  return handleOfficeResultRequest(request, uf, ElectionOffice.SENATOR);
}
