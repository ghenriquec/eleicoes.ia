import { prisma } from "@/lib/db/client";
import { OfficialResourceNotConfirmedError } from "../errors";
import type { CandidateAsset, SyncResult, TseCandidateAssetsDeclarationProvider } from "../types";

/**
 * Bens declarados (briefing "BENS"). Leitura já funciona contra o schema
 * existente. `syncAssets()` segue o mesmo padrão de download do CDN dos
 * candidatos (`bem_candidato_{ano}.zip`, mesma pasta `odsele`) — ainda não
 * confirmado com um payload real, então lança erro explícito em vez de
 * fingir sucesso (docs/tse-integration.md §5).
 */
export function createTseAssetsProvider(): TseCandidateAssetsDeclarationProvider {
  return {
    async syncAssets(): Promise<SyncResult> {
      throw new OfficialResourceNotConfirmedError("bem_candidato (bens declarados)");
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
