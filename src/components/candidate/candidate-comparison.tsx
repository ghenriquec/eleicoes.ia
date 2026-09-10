"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { UserRound, X, Search, FileText } from "lucide-react";
import { STATES } from "@/lib/domain/states";
import { OFFICES } from "@/lib/domain/offices";
import { getSavedUF } from "@/lib/local-storage/storage";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { formatBallotName } from "@/lib/format-name";

/** Formato plano da API interna — /api/elections/2026/candidates */
interface ListCandidate {
  id: string;
  ballotName: string;
  ballotNumber: string;
  photoUrl: string | null;
  partyAbbreviation: string;
  status: string;
  isMockData: boolean;
}

interface DetailCandidate {
  id: string;
  ballotName: string;
  ballotNumber: string;
  photoUrl: string | null;
  status: string;
  occupation: string | null;
  educationLevel: string | null;
  state: { name: string; uf: string };
  office: { name: string; slug: string };
  party: { name: string; acronym: string };
  assets: { assetType: string; description: string; valueCents: string }[];
  proposal: {
    sourceUrl: string;
    documentName: string;
    excerpts: { id: string; summary: string; sourcePage: number | null; topic: { name: string } }[];
  } | null;
}

const centsToBRL = (cents: string) => (Number(cents) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function CandidateComparison() {
  const [uf, setUf] = useState("");
  const [office, setOffice] = useState("");
  const [list, setList] = useState<ListCandidate[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [details, setDetails] = useState<DetailCandidate[] | null>(null);

  useEffect(() => {
    // Hidratação única a partir do localStorage (indisponível no SSR) — não é
    // um espelhamento contínuo de estado externo, então o efeito roda só uma
    // vez no mount, o padrão recomendado para evitar mismatch de hidratação.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUf(getSavedUF() ?? "");
  }, []);

  useEffect(() => {
    // Estado derivado da troca de uf/office (não de uma fonte externa) —
    // legítimo resetar seleção ao trocar de filtro, antes do fetch assíncrono.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setList(null);
    setSelectedIds([]);
    setDetails(null);
    if (!uf || !office) return;
    // Presidente é cargo nacional — candidatos ficam sob a UF "BR", nunca a UF escolhida.
    const stateParam = office === "presidente" ? "" : `&state=${uf}`;
    fetch(`/api/elections/2026/candidates?office=${office}${stateParam}`)
      .then((r) => r.json())
      .then((body) => setList(body.data));
  }, [uf, office]);

  function addCandidate(id: string) {
    setSelectedIds((prev) => (prev.includes(id) || prev.length >= 4 ? prev : [...prev, id]));
  }

  function removeCandidate(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  async function runComparison() {
    // Endpoint próprio (não /api/elections/2026) porque a comparação inclui o
    // plano de governo — não é dado bruto do TSE, é um recurso do produto
    // construído em cima dele.
    const res = await fetch(`/api/candidates/detail?ids=${selectedIds.join(",")}`);
    const data = await res.json();
    setDetails(data.candidates);
  }

  const selectedCandidates = list?.filter((c) => selectedIds.includes(c.id)) ?? [];

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Select value={uf} onChange={(e) => setUf(e.target.value)} className="w-auto py-2.5 text-sm">
          <option value="">Estado</option>
          {STATES.map((s) => (
            <option key={s.uf} value={s.uf}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select value={office} onChange={(e) => setOffice(e.target.value)} className="w-auto py-2.5 text-sm">
          <option value="">Cargo</option>
          {OFFICES.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.name}
            </option>
          ))}
        </Select>
      </div>

      {list && (
        <div className="mt-5">
          <p className="mb-2 text-sm text-text-muted">Busque e selecione de 2 a 4 candidatos ({selectedIds.length}/4):</p>

          {selectedCandidates.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedCandidates.map((c) => (
                <span key={c.id} className="flex items-center gap-2 rounded-full border border-accent bg-accent-tint py-1 pl-1.5 pr-2.5 text-sm">
                  <span className="flex h-6 w-6 flex-none items-center justify-center overflow-hidden rounded-full bg-surface-2 text-taupe">
                    {c.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserRound size={12} />
                    )}
                  </span>
                  <span className="font-medium text-accent-ink">{formatBallotName(c.ballotName)}</span>
                  <button onClick={() => removeCandidate(c.id)} aria-label={`Remover ${c.ballotName}`} className="text-accent-ink/70 hover:text-accent-ink">
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {selectedIds.length < 4 && <CandidateSearch candidates={list} excludeIds={selectedIds} onPick={addCandidate} />}

          <Button className="mt-4" onClick={runComparison} disabled={selectedIds.length < 2}>
            Comparar {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
          </Button>
        </div>
      )}

      {details && details.length > 0 && (
        <div className="mt-8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="w-40" />
                  {details.map((c) => (
                    <th key={c.id} className="border-b border-border px-3 pb-3 text-left align-bottom">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-surface-2 text-taupe">
                        {c.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.photoUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <UserRound size={22} />
                        )}
                      </div>
                      <p className="mt-2 font-mono text-lg font-bold text-accent-ink">{c.ballotNumber}</p>
                      <p className="font-display text-sm font-semibold">{formatBallotName(c.ballotName)}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                <Row label="Partido" cells={details.map((c) => `${c.party.acronym}`)} />
                <Row label="Situação" cells={details.map((c) => c.status)} />
                <Row label="Ocupação" cells={details.map((c) => c.occupation ?? "—")} />
                <Row label="Formação" cells={details.map((c) => c.educationLevel ?? "—")} />
                <Row
                  label="Patrimônio total"
                  cells={details.map((c) => {
                    const total = c.assets.reduce((s, a) => s + Number(a.valueCents), 0);
                    return total > 0 ? centsToBRL(String(total)) : "Nenhum bem declarado";
                  })}
                />
              </tbody>
            </table>
          </div>

          <ProposalsSection details={details} />
        </div>
      )}
    </div>
  );
}

function CandidateSearch({
  candidates,
  excludeIds,
  onPick,
}: {
  candidates: ListCandidate[];
  excludeIds: string[];
  onPick: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const available = candidates.filter((c) => !excludeIds.includes(c.id));
    if (!query.trim()) return available.slice(0, 8);
    const q = query.toLowerCase();
    return available
      .filter((c) => c.ballotName.toLowerCase().includes(q) || c.ballotNumber.includes(q) || c.partyAbbreviation.toLowerCase().includes(q))
      .slice(0, 8);
  }, [candidates, excludeIds, query]);

  return (
    <div ref={containerRef} className="relative max-w-md">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe-ink" />
        <input
          type="search"
          placeholder="Digite o nome ou número do candidato"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          className="w-full rounded-xl border border-border-strong bg-surface py-2.5 pl-10 pr-4 text-sm placeholder:text-taupe-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint"
        />
      </div>
      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-sm text-text-muted">Nenhum candidato encontrado.</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {filtered.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      onPick(c.id);
                      setQuery("");
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-2"
                  >
                    <span className="flex h-8 w-8 flex-none items-center justify-center overflow-hidden rounded-lg bg-surface-2 text-taupe">
                      {c.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.photoUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <UserRound size={14} />
                      )}
                    </span>
                    <span className="font-mono text-sm font-bold text-accent-ink">{c.ballotNumber}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{formatBallotName(c.ballotName)}</span>
                    {c.isMockData && <MockDataBadge className="flex-none" />}
                    <span className="flex-none text-xs text-text-muted">{c.partyAbbreviation}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/** Propostas em destaque — cada candidato aponta pro PDF oficial; trechos aparecem só se já extraídos. */
function ProposalsSection({ details }: { details: DetailCandidate[] }) {
  return (
    <div className="mt-10">
      <h2 className="font-display text-lg font-semibold">Propostas de governo</h2>
      <p className="mt-1 text-sm text-text-muted">
        Direto do plano de governo registrado no TSE — nunca uma interpretação nossa do que o candidato &ldquo;quis dizer&rdquo;.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {details.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-surface p-4">
            <p className="font-display text-sm font-semibold">{formatBallotName(c.ballotName)}</p>
            {c.proposal ? (
              <>
                <a
                  href={c.proposal.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent-ink hover:underline"
                >
                  <FileText size={14} /> Ver plano de governo (PDF oficial)
                </a>
                {c.proposal.excerpts.length > 0 ? (
                  <ul className="mt-3 flex flex-col gap-2">
                    {c.proposal.excerpts.map((ex) => (
                      <li key={ex.id} className="rounded-lg bg-surface-2 p-2.5 text-xs">
                        <span className="font-mono font-semibold uppercase tracking-wide text-taupe-ink">{ex.topic.name}</span>
                        <p className="mt-1 text-text">{ex.summary}</p>
                        {ex.sourcePage && <p className="mt-1 text-taupe-ink">Plano de governo, pág. {ex.sourcePage}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-taupe-ink">Trechos por tema ainda não foram extraídos deste documento — o PDF oficial já está disponível acima.</p>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-text-muted">Plano de governo ainda não disponibilizado pelo TSE para este candidato.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, cells }: { label: string; cells: string[] }) {
  return (
    <tr>
      <td className="border-b border-border py-3 pr-3 font-medium text-text-muted">{label}</td>
      {cells.map((v, i) => (
        <td key={i} className="border-b border-border py-3 pr-3">
          {v}
        </td>
      ))}
    </tr>
  );
}
