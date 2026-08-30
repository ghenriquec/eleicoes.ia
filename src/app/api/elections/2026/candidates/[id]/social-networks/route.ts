import { prisma } from "@/lib/db/client";
import { tseJson, tseErrorResponse } from "@/integrations/tse/http-response";

/**
 * Nota: `TseSocialNetworkProvider` (briefing) só define `syncSocialNetworks()`,
 * sem método de leitura — lemos direto do modelo normalizado aqui até a
 * interface ganhar um getter oficial.
 */
export async function GET(_request: Request, { params }: RouteContext<"/api/elections/2026/candidates/[id]/social-networks">) {
  try {
    const { id } = await params;
    const rows = await prisma.candidateSocialNetwork.findMany({
      where: { candidate: { OR: [{ id }, { tseCandidateId: id }, { slug: id }] } },
    });
    return tseJson(rows.map((r) => ({ platform: r.platform, url: r.url })));
  } catch (err) {
    return tseErrorResponse(err);
  }
}
