import { getTseElectionDataProvider } from "@/integrations/tse";
import { tseJson, tseErrorResponse } from "@/integrations/tse/http-response";
import { serializeCandidate } from "@/integrations/tse/serialize";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: RouteContext<"/api/elections/2026/candidates/[id]">) {
  try {
    const { id } = await params;
    const tse = getTseElectionDataProvider();
    const candidate = await tse.candidates.getCandidateById(id);
    if (!candidate) return NextResponse.json({ error: "Candidato não encontrado." }, { status: 404 });
    return tseJson(serializeCandidate(candidate));
  } catch (err) {
    return tseErrorResponse(err);
  }
}
