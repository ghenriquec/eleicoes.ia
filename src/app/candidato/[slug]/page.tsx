import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { UserRound, Globe, ExternalLink, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { getCandidateBySlug } from "@/lib/data/candidates";
import { getState } from "@/lib/domain/states";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/candidato/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(slug);
  if (!candidate) return {};
  return {
    title: `${candidate.ballotName} — ${candidate.office.name} ${candidate.state.uf} 2026`,
    description: `Dados oficiais da candidatura de ${candidate.ballotName} (${candidate.party.acronym}, número ${candidate.ballotNumber}) a ${candidate.office.name} por ${candidate.state.name}.`,
  };
}

const centsToBRL = (cents: bigint) =>
  (Number(cents) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** DEFERIDA/análise ainda não concluída não são a mesma coisa que uma rejeição — nunca usar o tom de "perigo" para o normal. */
function statusBadgeVariant(status: string): "accent" | "danger" | "neutral" {
  if (status === "DEFERIDA" || status === "DEFERIDA COM RECURSO") return "accent";
  if (status === "INDEFERIDA" || status === "CASSADA" || status === "SUB JUDICE") return "danger";
  return "neutral"; // ex.: "AGUARDANDO ANÁLISE DA JUSTIÇA ELEITORAL"
}

export default async function CandidatePage({ params }: PageProps<"/candidato/[slug]">) {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(slug);
  if (!candidate) notFound();

  const totalAssets = candidate.assets.reduce((sum, a) => sum + a.valueCents, BigInt(0));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {candidate.isMockData && (
        <div className="mb-6 rounded-xl border border-taupe-tint bg-taupe-tint px-4 py-3 text-sm text-taupe-ink">
          <MockDataBadge className="mr-2" />
          Este é um perfil de exemplo, usado para desenvolvimento. Não representa uma pessoa real.
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex h-28 w-28 flex-none items-center justify-center overflow-hidden rounded-2xl bg-surface-2 text-taupe">
          {candidate.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={candidate.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserRound size={44} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-3xl font-bold tabular-nums text-accent-ink">{candidate.ballotNumber}</span>
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">{candidate.ballotName}</h1>
          </div>
          <p className="mt-1 text-text-muted">
            {candidate.office.name} · {candidate.state.name} ({candidate.state.uf})
          </p>
          <p className="mt-1 text-sm text-text-muted">
            {candidate.party.name} ({candidate.party.acronym})
            {candidate.coalition ? ` · Coligação ${candidate.coalition.name}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={statusBadgeVariant(candidate.status)}>
              Candidatura: {candidate.status}
            </Badge>
            <Badge variant="source">✓ Dados oficiais do TSE</Badge>
          </div>
          {candidate.statusDescription && <p className="mt-2 text-xs text-taupe-ink">{candidate.statusDescription}</p>}
        </div>
      </div>

      {/* Dados pessoais/eleitorais */}
      <Card className="mt-8">
        <h2 className="font-display text-lg font-semibold">Dados públicos eleitorais</h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          <Field label="Nome completo" value={candidate.fullName} />
          <Field label="Ocupação declarada" value={candidate.occupation} />
          <Field label="Grau de instrução" value={candidate.educationLevel} />
          <Field label="Ano de nascimento" value={candidate.birthYear ? String(candidate.birthYear) : null} />
          <Field label="Estado de nascimento" value={candidate.placeOfBirth ? (getState(candidate.placeOfBirth)?.name ?? candidate.placeOfBirth) : null} />
          <Field label="Nacionalidade" value={candidate.nationality} />
        </dl>
      </Card>

      {/* Patrimônio */}
      <Card className="mt-4">
        <h2 className="font-display text-lg font-semibold">Patrimônio declarado</h2>
        {candidate.assets.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">Nenhum bem declarado no conjunto de dados consultado.</p>
        ) : (
          <>
            <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-accent-ink">{centsToBRL(totalAssets)}</p>
            <ul className="mt-4 divide-y divide-border">
              {candidate.assets.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium">{a.assetType}</p>
                    <p className="text-text-muted">{a.description}</p>
                  </div>
                  <span className="font-mono tabular-nums">{centsToBRL(a.valueCents)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="mt-4 text-xs text-taupe-ink">
          Valores declarados à Justiça Eleitoral pelo próprio candidato. Fonte: TSE — Declaração de bens.
        </p>
      </Card>

      {/* Plano de governo */}
      {candidate.proposal && (
        <Card className="mt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Plano de governo</h2>
            <a
              href={candidate.proposal.sourceUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1 text-sm font-medium text-accent-ink hover:underline"
            >
              <FileText size={15} /> Documento original
            </a>
          </div>
          <p className="mt-1 text-xs text-taupe-ink">
            Obtido em {new Date(candidate.proposal.obtainedAt).toLocaleDateString("pt-BR")} · Fonte: Tribunal Superior
            Eleitoral
          </p>
          <div className="mt-4 space-y-4">
            {candidate.proposal.excerpts.map((ex) => (
              <div key={ex.id} className="rounded-xl border border-border bg-surface-2 p-4">
                <Badge variant="accent">{ex.topic.name}</Badge>
                <p className="mt-2 text-sm">{ex.summary}</p>
                <p className="mt-2 text-xs text-taupe-ink">
                  Resumo gerado a partir do documento oficial · pág. {ex.sourcePage}
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-medium text-accent-ink">Ver trecho original</summary>
                  <p className="mt-2 text-sm text-text-muted">&ldquo;{ex.originalText}&rdquo;</p>
                </details>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Redes sociais */}
      {candidate.socialNetworks.length > 0 && (
        <Card className="mt-4">
          <h2 className="font-display text-lg font-semibold">Redes sociais</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {candidate.socialNetworks.map((sn) => (
              <a
                key={sn.id}
                href={sn.url}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:border-accent"
              >
                <Globe size={15} />
                {sn.platform}
                <ExternalLink size={12} className="text-taupe-ink" />
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Fonte */}
      <Card className="mt-4">
        <h2 className="font-display text-lg font-semibold">Fonte destes dados</h2>
        {candidate.sources.map((s) => (
          <p key={s.id} className="mt-2 text-sm text-text-muted">
            {s.sourceName} · consultado em {new Date(s.retrievedAt).toLocaleDateString("pt-BR")}
          </p>
        ))}
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-wide text-taupe-ink">{label}</dt>
      <dd className="mt-0.5 text-sm">{value ?? "Dado ainda não disponibilizado pelo TSE."}</dd>
    </div>
  );
}
