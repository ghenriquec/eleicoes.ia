"use client";

import type { Ballot, BallotCandidateRef, BallotSlotKey } from "@/lib/domain/ballot";

const KEY = "votocerto:ballot";

export function getSavedBallot(): Ballot {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Ballot) : {};
  } catch {
    return {};
  }
}

export function setBallotSlot(slot: BallotSlotKey, candidate: BallotCandidateRef) {
  if (typeof window === "undefined") return;
  const ballot = getSavedBallot();
  ballot[slot] = candidate;
  window.localStorage.setItem(KEY, JSON.stringify(ballot));
}

export function removeBallotSlot(slot: BallotSlotKey) {
  if (typeof window === "undefined") return;
  const ballot = getSavedBallot();
  delete ballot[slot];
  window.localStorage.setItem(KEY, JSON.stringify(ballot));
}
