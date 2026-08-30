import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CircuitBreaker } from "./circuit-breaker";

describe("CircuitBreaker", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("começa CLOSED e permite tentativas", () => {
    const cb = new CircuitBreaker({ failureThreshold: 3, openDurationMs: 1000 });
    expect(cb.getState()).toBe("CLOSED");
    expect(cb.canAttempt()).toBe(true);
  });

  it("abre após atingir o limite de falhas consecutivas", () => {
    const cb = new CircuitBreaker({ failureThreshold: 3, openDurationMs: 1000 });
    cb.onFailure();
    cb.onFailure();
    expect(cb.getState()).toBe("CLOSED");
    cb.onFailure();
    expect(cb.getState()).toBe("OPEN");
    expect(cb.canAttempt()).toBe(false);
  });

  it("uma falha isolada não derruba o circuito", () => {
    const cb = new CircuitBreaker({ failureThreshold: 3, openDurationMs: 1000 });
    cb.onFailure();
    cb.onSuccess();
    cb.onFailure();
    cb.onFailure();
    expect(cb.getState()).toBe("CLOSED");
  });

  it("passa para HALF_OPEN depois do tempo de abertura", () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, openDurationMs: 1000 });
    cb.onFailure();
    expect(cb.getState()).toBe("OPEN");
    vi.advanceTimersByTime(1001);
    expect(cb.getState()).toBe("HALF_OPEN");
    expect(cb.canAttempt()).toBe(true);
  });

  it("uma falha em HALF_OPEN reabre imediatamente", () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, openDurationMs: 1000 });
    cb.onFailure();
    vi.advanceTimersByTime(1001);
    expect(cb.getState()).toBe("HALF_OPEN");
    cb.onFailure();
    expect(cb.getState()).toBe("OPEN");
  });

  it("sucesso em HALF_OPEN fecha o circuito", () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, openDurationMs: 1000 });
    cb.onFailure();
    vi.advanceTimersByTime(1001);
    cb.onSuccess();
    expect(cb.getState()).toBe("CLOSED");
  });
});
