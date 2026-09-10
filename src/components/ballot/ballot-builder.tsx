"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { UserRound, Check, X, Printer, RotateCcw, ImageDown } from "lucide-react";
import { STATES } from "@/lib/domain/states";
import { ballotSlotsForUF, validateBallotSelection, ballotProgress, type Ballot, type BallotCandidateRef, type BallotSlotKey } from "@/lib/domain/ballot";
import { getSavedBallot, setBallotSlot, removeBallotSlot } from "@/lib/local-storage/ballot-storage";
import { getSavedUF, saveUF, clearBallot } from "@/lib/local-storage/storage";
import { Button } from "@/components/ui/button";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { Select } from "@/components/ui/select";
import { OFFICE_ENUM_TO_SLUG, type ElectionOffice } from "@/integrations/tse/constants/offices";
import { formatBallotName } from "@/lib/format-name";

/** Formato plano da API interna (briefing "API INTERNA") — /api/elections/2026/candidates */
interface ApiCandidate {
  id: string;
  slug: string;
  ballotName: string;
  ballotNumber: string;
  photoUrl: string | null;
  status: string;
  isMockData: boolean;
  state: string;
  office: string;
  partyAbbreviation: string;
}

export function BallotBuilder() {
  const [uf, setUf] = useState("");
  const [ballot, setBallot] = useState<Ballot>({});
  const [openSlot, setOpenSlot] = useState<BallotSlotKey | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hidratação única a partir do localStorage — só no mount, padrão pra evitar mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUf(getSavedUF() ?? "");
    setBallot(getSavedBallot());
    setHydrated(true);
  }, []);

  const slots = useMemo(() => (uf ? ballotSlotsForUF(uf) : []), [uf]);
  const progress = uf ? ballotProgress(ballot, uf) : { filled: 0, total: 6 };

  function handlePick(slotKey: BallotSlotKey, candidate: ApiCandidate) {
    const ref: BallotCandidateRef = {
      candidateId: candidate.id,
      ballotNumber: candidate.ballotNumber,
      ballotName: candidate.ballotName,
      office: OFFICE_ENUM_TO_SLUG[candidate.office as ElectionOffice] as BallotCandidateRef["office"],
      uf: candidate.state,
      photoUrl: candidate.photoUrl,
      partyAcronym: candidate.partyAbbreviation,
      statusAtSelection: candidate.status,
    };
    const error = validateBallotSelection(ballot, slotKey, ref, uf);
    if (error) {
      alert(error.message);
      return;
    }
    setBallotSlot(slotKey, ref);
    setBallot(getSavedBallot());
    setOpenSlot(null);
  }

  function handleRemove(slotKey: BallotSlotKey) {
    removeBallotSlot(slotKey);
    setBallot(getSavedBallot());
  }

  if (!hydrated) return <div className="py-16 text-center text-text-muted">Carregando…</div>;

  if (!uf) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold">Em qual estado você vai votar?</h1>
        <p className="mt-2 text-text-muted">Isso define os 6 cargos da sua cola.</p>
        <Select
          className="mt-6 py-3.5 text-[15px]"
          value={uf}
          onChange={(e) => {
            setUf(e.target.value);
            saveUF(e.target.value);
          }}
        >
          <option value="">Selecione seu estado</option>
          {STATES.map((s) => (
            <option key={s.uf} value={s.uf}>
              {s.name} ({s.uf})
            </option>
          ))}
        </Select>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">Minha cola</h1>
          <p className="text-text-muted">
            {STATES.find((s) => s.uf === uf)?.name} · {progress.filled} de {progress.total} escolhas realizadas
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm("Trocar de estado? Sua cola atual continua salva, mas os cargos vão mudar.")) {
              setUf("");
              saveUF("");
            }
          }}
          className="text-sm font-medium text-accent-ink hover:underline"
        >
          Trocar estado
        </button>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${(progress.filled / progress.total) * 100}%` }}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {slots.map((slot, i) => {
          const chosen = ballot[slot.key];
          return (
            <div key={slot.key} className="rounded-2xl border border-border bg-surface p-4">
              <p className="font-mono text-xs text-taupe-ink">
                {String(i + 1).padStart(2, "0")} · {slot.label.toUpperCase()}
              </p>
              {chosen ? (
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-surface-2 text-taupe">
                    {chosen.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={chosen.photoUrl} alt="" className="h-full w-full rounded-lg object-cover" />
                    ) : (
                      <UserRound size={20} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-semibold">
                      <span className="font-mono text-accent-ink">{chosen.ballotNumber}</span> {formatBallotName(chosen.ballotName)}
                    </p>
                    <p className="truncate text-xs text-text-muted">{chosen.partyAcronym}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(slot.key)}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-taupe-ink hover:bg-danger-tint hover:text-danger"
                    aria-label={`Remover escolha de ${slot.label}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setOpenSlot(slot.key)}
                  className="mt-2 w-full rounded-xl border border-dashed border-border-strong py-3 text-sm font-medium text-text-muted hover:border-accent hover:text-accent-ink"
                >
                  + Escolher candidato
                </button>
              )}
            </div>
          );
        })}
      </div>

      {progress.filled === progress.total && (
        <div className="mt-8">
          <BallotSheet uf={uf} ballot={ballot} />
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          variant="ghost"
          onClick={() => {
            if (confirm("Isso apaga todas as escolhas da sua cola. Continuar?")) {
              clearBallot();
              setBallot({});
            }
          }}
        >
          <RotateCcw size={15} /> Limpar minha cola
        </Button>
      </div>

      {openSlot && (
        <CandidatePicker
          uf={uf}
          slotKey={openSlot}
          office={slots.find((s) => s.key === openSlot)!.office}
          label={slots.find((s) => s.key === openSlot)!.label}
          onClose={() => setOpenSlot(null)}
          onPick={(c) => handlePick(openSlot, c)}
        />
      )}
    </div>
  );
}

function CandidatePicker({
  uf,
  office,
  label,
  onClose,
  onPick,
}: {
  uf: string;
  slotKey: BallotSlotKey;
  office: string;
  label: string;
  onClose: () => void;
  onPick: (c: ApiCandidate) => void;
}) {
  const [candidates, setCandidates] = useState<ApiCandidate[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    // Presidente é cargo nacional — candidatos ficam sob a UF "BR", nunca a UF do eleitor.
    const stateParam = office === "presidente" ? "" : `&state=${uf}`;
    fetch(`/api/elections/2026/candidates?office=${office}${stateParam}`)
      .then((r) => r.json())
      .then((body) => setCandidates(body.data));
  }, [uf, office]);

  const filtered = candidates?.filter(
    (c) =>
      c.ballotName.toLowerCase().includes(query.toLowerCase()) ||
      c.ballotNumber.includes(query) ||
      c.partyAbbreviation.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-t-2xl bg-surface sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border p-4">
          <p className="font-display text-lg font-semibold">{label}</p>
          <input
            autoFocus
            placeholder="Buscar por nome, número ou partido"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border-strong bg-bg px-3 py-2 text-sm"
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {!candidates ? (
            <p className="p-6 text-center text-sm text-text-muted">Carregando candidatos…</p>
          ) : filtered && filtered.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onPick(c)}
                  className="flex items-center gap-3 rounded-xl p-2.5 text-left hover:bg-surface-2"
                >
                  <div className="flex h-9 w-9 flex-none items-center justify-center overflow-hidden rounded-lg bg-surface-2 text-taupe">
                    {c.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserRound size={16} />
                    )}
                  </div>
                  <span className="font-mono text-sm font-bold tabular-nums text-accent-ink">{c.ballotNumber}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{formatBallotName(c.ballotName)}</span>
                  {c.isMockData && <MockDataBadge className="flex-none" />}
                  <span className="flex-none text-xs text-text-muted">{c.partyAbbreviation}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="p-6 text-center text-sm text-text-muted">Nenhum candidato encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function BallotSheet({ uf, ballot }: { uf: string; ballot: Ballot }) {
  const slots = ballotSlotsForUF(uf);
  const stateName = STATES.find((s) => s.uf === uf)?.name ?? uf;
  const sheetRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  async function handleDownloadImage() {
    if (!sheetRef.current) return;
    setGenerating(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(sheetRef.current, { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true });
      const link = document.createElement("a");
      link.download = `minha-cola-${uf.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert("Não deu pra gerar a imagem agora — tente novamente.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      {/*
        Cores em hex fixo (não var(--token)) de propósito aqui dentro: o
        html-to-image nem sempre resolve custom properties do Tailwind v4 ao
        rasterizar, e o texto saía quase transparente no PNG exportado —
        achado real ao testar "Baixar como imagem".
      */}
      <div ref={sheetRef} className="rounded-2xl border-2 border-accent p-6 print:border-black" id="ballot-sheet" style={{ backgroundColor: "#ffffff" }}>
        <div className="mb-5 text-center">
          <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "#5a5f66" }}>
            Minha cola eleitoral · Eleições 2026
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold" style={{ color: "#17191c" }}>
            {stateName}
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          {slots.map((slot, i) => {
            const c = ballot[slot.key];
            if (!c) return null;
            return (
              <div key={slot.key} className="flex items-center gap-4 border-b pb-4 last:border-0" style={{ borderColor: "#dadbd5" }}>
                <span className="font-mono text-sm" style={{ color: "#5a5f66" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-lg" style={{ backgroundColor: "#eeede7", color: "#9a9d96" }}>
                  {c.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.photoUrl} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
                  ) : (
                    <UserRound size={20} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs uppercase tracking-wide" style={{ color: "#5a5f66" }}>
                    {slot.label}
                  </p>
                  <p className="mt-0.5 truncate font-display text-lg font-semibold" style={{ color: "#17191c" }}>
                    {formatBallotName(c.ballotName)}
                  </p>
                  <p className="truncate text-xs font-medium" style={{ color: "#5a5f66" }}>
                    {c.partyAcronym}
                  </p>
                </div>
                <span className="font-mono text-4xl font-black tabular-nums" style={{ color: "#27565c" }}>
                  {c.ballotNumber}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-xs font-medium print:hidden" style={{ color: "#27565c" }}>
          <Check size={12} className="mr-1 inline" /> Vote consciente. Confira sempre os dados oficiais antes de decidir.
        </p>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
        <Button onClick={handleDownloadImage} disabled={generating}>
          <ImageDown size={16} /> {generating ? "Gerando…" : "Baixar como imagem"}
        </Button>
        <Button onClick={() => window.print()} variant="secondary">
          <Printer size={16} /> Imprimir / salvar
        </Button>
      </div>
    </div>
  );
}
