import { getTseElectionDataProvider } from "@/integrations/tse";
import { tseJson, tseErrorResponse } from "@/integrations/tse/http-response";
import { serializeAsset } from "@/integrations/tse/serialize";

export async function GET(_request: Request, { params }: RouteContext<"/api/elections/2026/candidates/[id]/assets">) {
  try {
    const { id } = await params;
    const tse = getTseElectionDataProvider();
    const [assets, total] = await Promise.all([
      tse.assetsDeclaration.getCandidateAssets(id),
      tse.assetsDeclaration.getDeclaredAssetsTotal(id),
    ]);
    return tseJson({ items: assets.map(serializeAsset), totalCents: total.toString() });
  } catch (err) {
    return tseErrorResponse(err);
  }
}
