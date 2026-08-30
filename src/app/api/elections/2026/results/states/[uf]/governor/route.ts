import { ElectionOffice } from "@/integrations/tse";
import { handleOfficeResultRequest } from "@/integrations/tse/office-result-handler";

export async function GET(request: Request, { params }: RouteContext<"/api/elections/2026/results/states/[uf]/governor">) {
  const { uf } = await params;
  return handleOfficeResultRequest(request, uf, ElectionOffice.GOVERNOR);
}
