"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { STATES } from "@/lib/domain/states";
import { getSavedUF, saveUF, getSavedTopics, saveTopics, getSavedAnswers, saveAnswer } from "@/lib/quiz/storage";
import { Button } from "@/components/ui/button";

export interface WizardTopic {
  id: string;
  slug: string;
  name: string;
}
export interface WizardQuestion {
  id: string;
  text: string;
  explanation: string | null;
  topic: { name: string; slug: string };
  options: { id: string; text: string; normalizedPosition: number | null }[];
}

const MAX_TOPICS = 5;

export function QuizWizard({ topics, questions }: { topics: WizardTopic[]; questions: WizardQuestion[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [uf, setUf] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hidratação única a partir do localStorage (indisponível no SSR) — não é
    // um espelhamento contínuo de estado externo, então o efeito roda só uma
    // vez no mount, o padrão recomendado para evitar mismatch de hidratação.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUf(getSavedUF() ?? "");
    setSelectedTopics(getSavedTopics());
    setAnswers(getSavedAnswers());
    setHydrated(true);
  }, []);

  const totalSteps = 2 + questions.length;

  if (!hydrated) return <div className="py-16 text-center text-text-muted">Carregando…</div>;

  if (step === 0) {
    return (
      <StepShell step={1} total={totalSteps} title="Em qual estado você vota?">
        <select
          value={uf}
          onChange={(e) => setUf(e.target.value)}
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3.5 text-[15px]"
        >
          <option value="">Selecione seu estado</option>
          {STATES.map((s) => (
            <option key={s.uf} value={s.uf}>
              {s.name} ({s.uf})
            </option>
          ))}
        </select>
        <p className="mt-3 text-sm text-text-muted">Isso fica salvo só no seu aparelho, para mostrar os cargos e candidatos certos.</p>
        <Nav
          onNext={() => {
            saveUF(uf);
            setStep(1);
          }}
          nextDisabled={!uf}
        />
      </StepShell>
    );
  }

  if (step === 1) {
    return (
      <StepShell step={2} total={totalSteps} title="Quais assuntos mais influenciam sua decisão?" hint={`Escolha até ${MAX_TOPICS}`}>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => {
            const selected = selectedTopics.includes(t.slug);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelectedTopics((prev) => {
                    if (prev.includes(t.slug)) return prev.filter((s) => s !== t.slug);
                    if (prev.length >= MAX_TOPICS) return prev;
                    return [...prev, t.slug];
                  });
                }}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selected ? "border-accent bg-accent text-white" : "border-border bg-surface text-text hover:border-accent"
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
        <Nav
          onBack={() => setStep(0)}
          onNext={() => {
            saveTopics(selectedTopics);
            setStep(2);
          }}
          nextDisabled={selectedTopics.length === 0}
        />
      </StepShell>
    );
  }

  const qIndex = step - 2;
  if (qIndex < questions.length) {
    const q = questions[qIndex];
    const selectedOption = answers[q.id];
    return (
      <StepShell step={step + 1} total={totalSteps} title={q.text} eyebrow={q.topic.name}>
        {q.explanation && <p className="mb-4 text-sm text-text-muted">{q.explanation}</p>}
        <div className="flex flex-col gap-2.5">
          {q.options.map((opt) => {
            const selected = selectedOption === opt.normalizedPosition && answers[q.id] !== undefined;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.normalizedPosition }))}
                className={`rounded-xl border px-4 py-3.5 text-left text-[15px] transition-colors ${
                  selected ? "border-accent bg-accent text-white font-medium" : "border-border bg-surface hover:border-accent"
                }`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
        <Nav
          onBack={() => setStep(step - 1)}
          onNext={() => {
            saveAnswer(q.id, answers[q.id] ?? null);
            if (qIndex === questions.length - 1) {
              router.push("/quiz/resultado");
            } else {
              setStep(step + 1);
            }
          }}
          nextDisabled={!(q.id in answers)}
          nextLabel={qIndex === questions.length - 1 ? "Ver meu mapa de prioridades" : "Próxima"}
        />
      </StepShell>
    );
  }

  return null;
}

function StepShell({
  step,
  total,
  title,
  eyebrow,
  hint,
  children,
}: {
  step: number;
  total: number;
  title: string;
  eyebrow?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="font-mono text-xs uppercase tracking-wide text-taupe-ink">
        Etapa {step} de {total}
      </p>
      {eyebrow && (
        <span className="mt-2 inline-block rounded-full bg-accent-tint px-2.5 py-1 font-mono text-[11px] font-semibold text-accent-ink">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-2 text-balance font-display text-xl font-semibold sm:text-2xl">{title}</h2>
      {hint && <p className="mt-1 text-sm text-text-muted">{hint}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Nav({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = "Próxima",
}: {
  onBack?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="mt-7 flex items-center justify-between">
      {onBack ? (
        <Button variant="ghost" onClick={onBack}>
          Voltar
        </Button>
      ) : (
        <span />
      )}
      <Button onClick={onNext} disabled={nextDisabled}>
        {nextLabel}
      </Button>
    </div>
  );
}
