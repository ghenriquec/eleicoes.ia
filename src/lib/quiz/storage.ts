"use client";

/**
 * Persistência 100% local do quiz e da cola (briefing §32). Nunca existe uma
 * chamada de rede aqui — Tier 2 (dado sensível) nunca sai do dispositivo.
 * Ver blueprint §08 (Modelo de privacidade).
 */

const KEYS = {
  uf: "votocerto:uf",
  topics: "votocerto:quiz:topics",
  answers: "votocerto:quiz:answers",
  ballot: "votocerto:ballot",
} as const;

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Armazenamento indisponível (modo privado, quota) — degrada silenciosamente.
  }
}

export function getSavedUF(): string | null {
  return safeGet<string | null>(KEYS.uf, null);
}
export function saveUF(uf: string) {
  safeSet(KEYS.uf, uf);
}

export function getSavedTopics(): string[] {
  return safeGet<string[]>(KEYS.topics, []);
}
export function saveTopics(topicSlugs: string[]) {
  safeSet(KEYS.topics, topicSlugs);
}

/** questionId -> normalizedPosition escolhido (ou null se "não sei") */
export type QuizAnswers = Record<string, number | null>;

export function getSavedAnswers(): QuizAnswers {
  return safeGet<QuizAnswers>(KEYS.answers, {});
}
export function saveAnswer(questionId: string, value: number | null) {
  const current = getSavedAnswers();
  current[questionId] = value;
  safeSet(KEYS.answers, current);
}

export function clearQuizData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEYS.topics);
  window.localStorage.removeItem(KEYS.answers);
}

export function clearBallot() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEYS.ballot);
}

export function clearAllLocalData() {
  clearQuizData();
  clearBallot();
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEYS.uf);
}
