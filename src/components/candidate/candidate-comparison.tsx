"use client";

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { STATES } from "@/lib/domain/states";
import { OFFICES } from "@/lib/domain/offices";
import { getSavedUF, getSavedAnswers } from "@/lib/quiz/storage";
import { compareAnswer, COMPARISON_LABEL, type ComparisonResult } from "@/lib/quiz/compare";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ListCandidate {
  id: string;
  ballotName: string;
  ballotNumber: string;
  party: { acronym: string };
  status: string;
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
  topicPositions: {
    questionId: string;
    position: number;
    confidence: number;
    sourceExcerpt: string | null;
    question: { text: string; topic: { name: string } };
  }[];
}

const COMPARISON_TONE: Record<ComparisonResult, "accent" | "danger" | "neutral"> = {
  MATCH: "accent",
  PARTIAL_MATCH: "neutral",
  DIFFERENT: "danger",
  UNKNOWN: "neutral",
};

const centsToBRL = (cents: string) => (Number(cents) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function CandidateComparison() {
  const [uf, setUf] = useState("");
  const [office, setOffice] = useState("");
  const [list, setList] = useState<ListCandidate[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [details, setDetails] = useState<DetailCandidate[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number | null>>({});

  useEffect(() => {
    // Hidratação única a partir do localStorage — ver nota em quiz-wizard.tsx.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUf(getSavedUF() ?? "");
    setUserAnswers(getSavedAnswers());
  }, []);

  useEffect(() => {
    // Estado derivado da troca de uf/office (não de uma fonte externa) —
    // legítimo resetar seleção ao trocar de filtro, antes do fetch assíncrono.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setList(null);
    setSelectedIds([]);
    setDetails(null);
    if (!uf || !office) return;
    fetch(`/api/candidates?uf=${uf}&office=${office}`)
      .then((r) => r.json())
      .then((d) => setList(d.candidates));
  }, [uf, office]);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  async function runComparison() {
    const res = await fetch(`/api/candidates/detail?ids=${selectedIds.join(",")}`);
    const data = await res.json();
    setDetails(data.candidates);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <select value={uf} onChange={(e) => setUf(e.target.value)} className="rounded-xl border border-border-strong bg-surface px-3 py-2.5 text-sm">
          <option value="">Estado</option>
          {STATES.map((s) => (
            <option key={s.uf} value={s.uf}>
              {s.name}
            </option>
          ))}
        </select>
        <select value={office} onChange={(e) => setOffice(e.target.value)} className="rounded-xl border border-border-strong bg-surface px-3 py-2.5 text-sm">
          <option value="">Cargo</option>
          {OFFICES.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.name}
            </option>
          ))}
        </select>
      </div>

      {list && (
        <div className="mt-5">
          <p className="mb-2 text-sm text-text-muted">Selecione de 2 a 4 candidatos ({selectedIds.length}/4):</p>
          <div className="flex flex-wrap gap-2">
            {list.map((c) => {
              const selected = selectedIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggle(c.id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                    selected ? "border-accent bg-accent text-white" : "border-border bg-surface hover:border-accent"
                  }`}
                >
                  <span className="font-mono font-bold">{c.ballotNumber}</span> {c.ballotName}
                </button>
              );
            })}
          </div>
          <Button className="mt-4" onClick={runComparison} disabled={selectedIds.length < 2}>
            Comparar {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
          </Button>
        </div>
      )}

      {details && details.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="w-40" />
                {details.map((c) => (
                  <th key={c.id} className="border-b border-border px-3 pb-3 text-left align-bottom">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-2 text-taupe">
                      {c.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.photoUrl} alt="" className="h-full w-full rounded-xl object-cover" />
                      ) : (
                        <UserRound size={22} />
                      )}
                    </div>
                    <p className="mt-2 font-mono text-lg font-bold text-accent-ink">{c.ballotNumber}</p>
                    <p className="font-display text-sm font-semibold">{c.ballotName}</p>
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
              {getComparableQuestions(details).map((q) => (
                <tr key={q.questionId}>
                  <td className="border-b border-border py-3 pr-3 align-top font-mono text-xs text-taupe-ink">{q.text}</td>
                  {details.map((c) => {
                    const pos = c.topicPositions.find((p) => p.questionId === q.questionId);
                    const userVal = userAnswers[q.questionId];
                    const result = compareAnswer(
                      userVal === undefined ? null : userVal,
                      pos ? { position: pos.position, confidence: pos.confidence, sourceExcerpt: pos.sourceExcerpt } : null,
                    );
                    return (
                      <td key={c.id} className="border-b border-border py-3 pr-3 align-top">
                        <Badge variant={COMPARISON_TONE[result]}>{COMPARISON_LABEL[result]}</Badge>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-taupe-ink">
            A comparação usa apenas posições públicas documentadas, com fonte. Sem fonte, o resultado é sempre
            &ldquo;Sem informação suficiente&rdquo; — nunca uma suposição.
          </p>
        </div>
      )}
    </div>
  );
}

function getComparableQuestions(details: DetailCandidate[]) {
  const map = new Map<string, { questionId: string; text: string }>();
  for (const c of details) {
    for (const p of c.topicPositions) {
      if (!map.has(p.questionId)) map.set(p.questionId, { questionId: p.questionId, text: p.question.text });
    }
  }
  return [...map.values()];
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
