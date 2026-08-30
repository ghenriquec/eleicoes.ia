import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/client";
import { TSE_CONFIG } from "@/integrations/tse/config";

export async function GET() {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  const [lastCandidateSync, lastResultSnapshot] = await Promise.all([
    prisma.dataSyncLog.findFirst({ orderBy: { startedAt: "desc" } }),
    prisma.electionResultSnapshot.findFirst({ orderBy: { receivedAt: "desc" } }),
  ]);

  return NextResponse.json({
    resultsMode: TSE_CONFIG.resultsMode,
    resultsBaseUrl: TSE_CONFIG.resultsBaseUrl,
    candidatesCdnBaseUrl: TSE_CONFIG.candidatesCdnBaseUrl,
    lastCandidateSync,
    lastResultSnapshot: lastResultSnapshot ? { ...lastResultSnapshot, payload: undefined } : null,
  });
}
