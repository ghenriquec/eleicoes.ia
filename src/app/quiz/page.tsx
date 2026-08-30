import type { Metadata } from "next";
import { QuizWizard } from "@/components/quiz/quiz-wizard";
import { listTopics, listQuestions } from "@/lib/data/quiz";

export const metadata: Metadata = { title: "Quiz — o que importa para você nesta eleição?" };
export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const [topics, questions] = await Promise.all([listTopics(), listQuestions()]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">O que importa para você nesta eleição?</h1>
        <p className="mt-2 text-text-muted">
          Este questionário ajuda você a organizar os assuntos que deseja comparar entre os candidatos. Sem
          pegadinha partidária — e você pode responder &ldquo;não sei&rdquo; sempre que quiser.
        </p>
      </div>
      <QuizWizard topics={topics} questions={questions} />
    </div>
  );
}
