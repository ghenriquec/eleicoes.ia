import { prisma } from "@/lib/db/client";
import { syncAssets as syncAssetsImpl } from "./asset-sync";
import type { CandidateAsset, SyncResult, TseCandidateAssetsDeclarationProvider } from "../types";

/**
 * Bens declarados (briefing "BENS"). `syncAssets()` segue o mesmo padrão de
 * download do CDN dos candidatos (`bem_candidato_{ano}.zip`, mesma pasta
 * `odsele`) — confirmado contra um payload real em 30/08/2026, ver
 * docs/tse-integration.md §5.
 */
export function createTseAssetsProvider(): TseCandidateAssetsDeclarationProvider {
  return {
    async syncAssets(electionYear: number): Promise<SyncResult> {
      return syncAssetsImpl(electionYear);
    },

    async getCandidateAssets(candidateId: string): Promise<CandidateAsset[]> {
      const rows = await prisma.candidateAsset.findMany({
        where: { candidate: { OR: [{ id: candidateId }, { tseCandidateId: candidateId }, { slug: candidateId }] } },
      });
      return rows.map((r) => ({
        id: r.id,
        candidateId: r.candidateId,
        assetType: r.assetType,
        description: r.description,
        valueCents: r.valueCents,
        sourceId: null,
      }));
    },

    async getDeclaredAssetsTotal(candidateId: string): Promise<bigint> {
      const assets = await this.getCandidateAssets(candidateId);
      return assets.reduce((sum, a) => sum + a.valueCents, BigInt(0));
    },
  };
}
