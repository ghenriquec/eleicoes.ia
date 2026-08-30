import { getTseElectionDataProvider } from "@/integrations/tse";
import { tseJson, tseErrorResponse } from "@/integrations/tse/http-response";

export async function GET(_request: Request, { params }: RouteContext<"/api/elections/2026/candidates/[id]/government-proposal">) {
  try {
    const { id } = await params;
    const tse = getTseElectionDataProvider();
    const proposal = await tse.governmentProposals.getGovernmentProposal(id);
    return tseJson(proposal);
  } catch (err) {
    return tseErrorResponse(err);
  }
}
