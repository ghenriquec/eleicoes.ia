"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSavedUF, getSavedTopics, getSavedAnswers, clearQuizData } from "@/lib/quiz/storage";
import { TOPICS } from "@/lib/quiz/content";

export default function QuizResultPage() {
  const router = useRouter();
  const [uf, setUf] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hidratação única a partir do localStorage — ver nota em quiz-wizard.tsx.
    const answers = getSavedAnswers();
    const values = Object.values(answers);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUf(getSavedUF());
    setTopics(getSavedTopics());
    setTotalCount(values.length);
    setAnsweredCount(values.filter((v) => v !== null).length);
    setHydrated(true);
  }, []);

  if (!hydrated) return <div className="py-16 text-center text-text-muted">Carregando…</div>;

  if (topics.length === 0 || totalCount === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold">Você ainda não fez o quiz</h1>
        <p className="mt-2 text-text-muted">Responda ao questionário para ver seu mapa de prioridades.</p>
        <Button href="/quiz" className="mt-6">
          Fazer o quiz
        </Button>
      </div>
    );
  }

  const topicNames = topics.map((slug) => TOPICS.find((t) => t.slug === slug)?.name ?? slug);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Seu mapa de prioridades</h1>
      <p className="mt-2 text-text-muted">
        Você respondeu {answeredCount} de {totalCount} perguntas
        {uf ? (
          <>
            {" "}
            para <strong className="text-text">{uf}</strong>
          </>
        ) : null}
        .
      </p>

      <Card className="mt-6">
        <ol className="flex flex-col gap-2.5">
          {topicNames.map((name, i) => (
            <li key={name} className="flex items-center gap-3">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-accent-tint font-mono text-xs font-bold text-accent-ink">
                {i + 1}
              </span>
              <span className="font-medium">{name}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="mt-4">
        <p className="text-sm text-text-muted">
          Agora você pode comparar suas respostas com posições públicas documentadas dos candidatos ao seu estado.
          Isso não é uma recomendação de voto — é um jeito de organizar sua própria pesquisa, questão por questão,
          sempre mostrando a fonte.
        </p>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button href={uf ? `/candidatos?uf=${uf}` : "/candidatos"}>
          Comparar com candidatos <ArrowRight size={16} />
        </Button>
        <Button href="/minha-cola" variant="secondary">
          Ir para minha cola
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            clearQuizData();
            router.push("/quiz");
          }}
        >
          <RotateCcw size={15} /> Refazer o quiz
        </Button>
      </div>

      <p className="mt-8 text-xs text-taupe-ink">
        Suas respostas ficam salvas só neste aparelho.{" "}
        <Link href="/privacidade" className="underline">
          Saiba mais sobre privacidade
        </Link>
        .
      </p>
    </div>
  );
}
