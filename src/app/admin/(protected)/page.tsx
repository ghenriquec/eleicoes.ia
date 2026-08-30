import type { Metadata } from "next";
import { prisma } from "@/lib/db/client";
import { TSE_CONFIG } from "@/lib/tse-client/config";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Painel administrativo" };

export default async function AdminDashboard() {
  const [
    totalCandidates,
    mockCandidates,
    withoutPhoto,
    lastSync,
    openCorrections,
    proposalsCount,
    lowConfidenceExcerpts,
    byOffice,
  ] = await Promise.all([
    prisma.candidate.count(),
    prisma.candidate.count({ where: { isMockData: true } }),
    prisma.candidate.count({ where: { photoUrl: null } }),
    prisma.dataSyncLog.findFirst({ orderBy: { startedAt: "desc" } }),
    prisma.correctionReport.count({ where: { status: "OPEN" } }),
    prisma.governmentProposal.count(),
    prisma.governmentProposalExcerpt.count({ where: { extractionConfidence: { lt: 0.7 } } }),
    prisma.candidate.groupBy({ by: ["officeId"], _count: true }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Painel administrativo</h1>
        <p className="mt-1 text-text-muted">Visão geral dos dados do votocerto.ia.</p>
      </div>

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-taupe-ink">Candidatos</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total importado" value={totalCandidates} />
          <Stat label="Dados de exemplo" value={mockCandidates} warn={mockCandidates > 0} />
          <Stat label="Sem foto" value={withoutPhoto} />
          <Stat label="Cargos distintos" value={byOffice.length} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-taupe-ink">Dados / sincronização</h2>
        <Card>
          {lastSync ? (
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-taupe-ink">Fonte</dt>
                <dd className="mt-0.5 font-medium">{lastSync.source}</dd>
              </div>
              <div>
                <dt className="text-taupe-ink">Status</dt>
                <dd className="mt-0.5">
                  <Badge variant={lastSync.status === "SUCCESS" ? "accent" : "danger"}>{lastSync.status}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-taupe-ink">Registros</dt>
                <dd className="mt-0.5 font-mono">{lastSync.recordsReceived}</dd>
              </div>
              <div>
                <dt className="text-taupe-ink">Quando</dt>
                <dd className="mt-0.5">{new Date(lastSync.startedAt).toLocaleString("pt-BR")}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-text-muted">Nenhuma sincronização registrada ainda.</p>
          )}
        </Card>
      </section>

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-taupe-ink">Apuração</h2>
        <Card>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-taupe-ink">Modo</dt>
              <dd className="mt-0.5 font-mono">{TSE_CONFIG.resultsMode}</dd>
            </div>
            <div>
              <dt className="text-taupe-ink">URL de resultados confirmada?</dt>
              <dd className="mt-0.5">
                <Badge variant={TSE_CONFIG.resultsDownloadBaseUrl ? "accent" : "mock"}>
                  {TSE_CONFIG.resultsDownloadBaseUrl ? "Sim" : "Pendente (ver blueprint §19)"}
                </Badge>
              </dd>
            </div>
          </dl>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-taupe-ink">Propostas de governo</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Documentos processados" value={proposalsCount} />
          <Stat label="Baixa confiança (IA)" value={lowConfidenceExcerpts} warn={lowConfidenceExcerpts > 0} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-taupe-ink">Correções</h2>
        <Stat label="Abertas, aguardando revisão" value={openCorrections} warn={openCorrections > 0} />
      </section>
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <Card>
      <p className={`font-mono text-2xl font-bold ${warn ? "text-danger" : "text-accent-ink"}`}>{value}</p>
      <p className="mt-1 text-xs text-text-muted">{label}</p>
    </Card>
  );
}
