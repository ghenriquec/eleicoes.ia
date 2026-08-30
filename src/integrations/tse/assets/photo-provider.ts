import { prisma } from "@/lib/db/client";
import { OfficialResourceNotConfirmedError } from "../errors";
import type { CandidatePhoto, SyncResult, TseCandidateAssetsProvider } from "../types";

/**
 * Fotos oficiais (briefing "FOTOS"). O TSE organiza fotos por UF dentro do
 * dataset — ainda não confirmado com um payload real nesta sessão. Nunca
 * hotlinkamos direto do TSE sem essa confirmação: preferimos servir do
 * nosso próprio storage (TSE_RAW_STORAGE_BUCKET), mantendo `sourceUrl` como
 * referência à origem.
 */
export function createTsePhotoProvider(): TseCandidateAssetsProvider {
  return {
    async syncPhotos(): Promise<SyncResult> {
      throw new OfficialResourceNotConfirmedError("fotos de candidatos");
    },

    async getCandidatePhoto(candidateId: string): Promise<CandidatePhoto | null> {
      const candidate = await prisma.candidate.findFirst({
        where: { OR: [{ id: candidateId }, { tseCandidateId: candidateId }, { slug: candidateId }] },
        select: { id: true, photoUrl: true, sourceUpdatedAt: true },
      });
      if (!candidate?.photoUrl) return null;
      return {
        candidateId: candidate.id,
        url: candidate.photoUrl,
        sourceUrl: candidate.photoUrl,
        downloadedAt: candidate.sourceUpdatedAt,
      };
    },
  };
}
