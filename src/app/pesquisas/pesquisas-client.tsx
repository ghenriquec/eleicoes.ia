"use client";

import { useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import { Select } from "@/components/ui/select";
import { formatBallotName } from "@/lib/format-name";
import { getState } from "@/lib/domain/states";
import type { PollData } from "@/lib/data/polls";

type Office = "presidente" | "governador";

const OFFICE_LABEL: Record<Office, string> = { presidente: "Presidente", governador: "Governador" };

export function PesquisasClient({ polls, ufs }: { polls: PollData[]; ufs: string[] }) {
  const [office, setOffice] = useState<Office>("presidente");
  const [uf, setUf] = useState<string>(ufs[0] ?? "");

  const filtered = useMemo(() => {
    return polls.filter((p) => p.office === office && (office === "presidente" || p.uf === uf));
  }, [polls, office, uf]);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface-2 p-1">
        {(["presidente", "governador"] as Office[]).map((o) => (
          <button
            key={o}
            onClick={() => setOffice(o)}
            className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors ${
              office === o ? "bg-surface text-accent-ink shadow-sm" : "text-text-muted hover:text-text"
            }`}
          >
            {OFFICE_LABEL[o]}
          </button>
        ))}
      </div>

      {office === "governador" && (
        <div className="mt-3">
          {ufs.length > 0 ? (
            <Select value={uf} onChange={(e) => setUf(e.target.value)} className="w-auto">
              {ufs.map((code) => (
                <option key={code} value={code}>
                  {getState(code)?.name ?? code}
                </option>
              ))}
            </Select>
          ) : (
            <p className="rounded-xl border border-border bg-surface-2 p-4 text-sm text-text-muted">
              Ainda não temos pesquisas cadastradas pra governador. Assim que um instituto registrado no TSE publicar
              uma, ela aparece aqui.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-6">
        {filtered.length === 0 && office === "presidente" && (
          <p className="rounded-xl border border-border bg-surface-2 p-4 text-sm text-text-muted">
            Ainda não temos pesquisas cadastradas pra presidente.
          </p>
        )}
        {filtered.map((poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </div>
    </div>
  );
}

function PollCard({ poll }: { poll: PollData }) {
  const top = poll.results.slice(0, 8);
  const rest = poll.results.slice(8);
  const maxPct = Math.max(...poll.results.map((r) => r.percentage), 1);

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">{poll.institute}</h2>
        <span className="text-sm text-text-muted">
          {poll.round}º turno · {formatDate(poll.publishedAt)}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap gap-2 text-[13px] text-text-muted">
        <span>{poll.questionType}</span>
        {poll.sampleSize && <span>· {poll.sampleSize.toLocaleString("pt-BR")} entrevistados</span>}
        {poll.marginOfError != null && <span>· margem de erro {poll.marginOfError} p.p.</span>}
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {top.map((r) => (
          <ResultRow key={r.candidateName} result={r} maxPct={maxPct} />
        ))}
      </div>

      {rest.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm font-medium text-accent-ink">Ver todos ({poll.results.length})</summary>
          <div className="mt-2.5 flex flex-col gap-2.5">
            {rest.map((r) => (
              <ResultRow key={r.candidateName} result={r} maxPct={maxPct} />
            ))}
          </div>
        </details>
      )}

      <div className="mt-4 border-t border-border pt-3 text-[13px] text-text-muted">
        Fonte:{" "}
        <a href={poll.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-accent-ink hover:underline">
          {poll.sourceName}
        </a>
      </div>
    </div>
  );
}

function ResultRow({ result, maxPct }: { result: PollData["results"][number]; maxPct: number }) {
  const displayName = result.candidate ? formatBallotName(result.candidate.ballotName) : result.candidateName;
  const barWidth = `${(result.percentage / maxPct) * 100}%`;

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 flex-none items-center justify-center overflow-hidden rounded-full bg-surface-2 text-taupe">
        {result.candidate?.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={result.candidate.photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <UserRound size={16} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[14px] font-medium">
            {result.candidate ? (
              <a href={`/candidato/${result.candidate.slug}`} className="hover:underline">
                {displayName}
              </a>
            ) : (
              displayName
            )}
            {result.partyAcronym && <span className="ml-1.5 text-[12px] font-normal text-text-muted">{result.partyAcronym}</span>}
          </span>
          <span className="flex-none font-mono text-[15px] font-bold tabular-nums text-accent-ink">
            {result.percentage.toLocaleString("pt-BR")}%
          </span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-accent" style={{ width: barWidth }} />
        </div>
      </div>
    </div>
  );
}

function formatDate(d: Date): string {
  // Datas de pesquisa são guardadas sem hora (meia-noite UTC) — força UTC na
  // exibição, senão fusos negativos (ex. Brasil) mostram o dia anterior.
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}
