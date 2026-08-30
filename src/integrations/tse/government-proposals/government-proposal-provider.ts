import { prisma } from "@/lib/db/client";
import { OfficialResourceNotConfirmedError } from "../errors";
import type { GovernmentProposal, SyncResult, TseGovernmentProposalProvider } from "../types";

/**
 * Plano de governo (briefing "PLANO DE GOVERNO"). O documento original
 * nunca é substituído por resumo — `localStoragePath` só é preenchido
 * depois de baixar e armazenar o PDF de verdade.
 */
export function createTseGovernmentProposalProvider(): TseGovernmentProposalProvider {
  return {
    async syncGovernmentProposals(): Promise<SyncResult> {
      throw new OfficialResourceNotConfirmedError("proposta de governo (PDF)");
    },

    async getGovernmentProposal(candidateId: string): Promise<GovernmentProposal | null> {
      const row = await prisma.governmentProposal.findFirst({
        where: { candidate: { OR: [{ id: candidateId }, { tseCandidateId: candidateId }, { slug: candidateId }] } },
      });
      if (!row) return null;
      return {
        id: row.id,
        candidateId: row.candidateId,
        title: row.documentName,
        originalUrl: row.sourceUrl,
        localStoragePath: null,
        checksum: null,
        downloadedAt: row.obtainedAt,
      };
    },
  };
}
