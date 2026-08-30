import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

/**
 * Não consulta o TSE a cada request (isso seria o próprio anti-padrão que a
 * arquitetura evita — briefing §7). Reporta o status da última sincronização
 * registrada pelo worker.
 */
export async function GET() {
  const lastSync = await prisma.dataSyncLog.findFirst({ orderBy: { startedAt: "desc" } });
  if (!lastSync) return NextResponse.json({ status: "unknown", message: "Nenhuma sincronização registrada ainda." });

  return NextResponse.json({
    status: lastSync.status === "SUCCESS" || lastSync.status === "NO_CHANGES" ? "ok" : "degraded",
    lastSync: lastSync.startedAt,
    source: lastSync.source,
  });
}
