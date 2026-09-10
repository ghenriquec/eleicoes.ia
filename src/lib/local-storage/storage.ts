"use client";

/**
 * Persistência 100% local do estado e da cola (briefing §32). Nunca existe
 * uma chamada de rede aqui — Tier 2 (dado sensível) nunca sai do dispositivo.
 * Ver blueprint §08 (Modelo de privacidade).
 */

const KEYS = {
  uf: "votocerto:uf",
  ufSource: "votocerto:uf-source",
  geoAsked: "votocerto:geo-asked",
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

export type UFSource = "manual" | "geolocation";

/** `source` fica salvo só para transparência (ex.: mostrar "detectamos automaticamente"). */
export function saveUF(uf: string, source: UFSource = "manual") {
  safeSet(KEYS.uf, uf);
  safeSet(KEYS.ufSource, source);
}

export function getUFSource(): UFSource | null {
  return safeGet<UFSource | null>(KEYS.ufSource, null);
}

export function clearUF() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEYS.uf);
  window.localStorage.removeItem(KEYS.ufSource);
}

/** Nunca perguntamos automaticamente mais de uma vez por dispositivo. */
export function wasGeoAsked(): boolean {
  return safeGet<boolean>(KEYS.geoAsked, false);
}
export function markGeoAsked() {
  safeSet(KEYS.geoAsked, true);
}

export function clearBallot() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEYS.ballot);
}

export function clearAllLocalData() {
  clearBallot();
  clearUF();
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEYS.geoAsked);
}
