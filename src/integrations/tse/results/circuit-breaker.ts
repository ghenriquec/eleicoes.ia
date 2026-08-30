/**
 * Circuit breaker CLOSED/OPEN/HALF_OPEN (blueprint §10 / briefing
 * "RESILIÊNCIA"). Protege o TSE de retry agressivo quando está fora do ar e
 * garante que a API sirva o último snapshot válido em vez de erro/zero.
 */
export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  failureThreshold: number;
  openDurationMs: number;
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private consecutiveFailures = 0;
  private openedAt: number | null = null;

  constructor(private readonly options: CircuitBreakerOptions = { failureThreshold: 3, openDurationMs: 60_000 }) {}

  getState(): CircuitState {
    if (this.state === "OPEN" && this.openedAt && Date.now() - this.openedAt >= this.options.openDurationMs) {
      this.state = "HALF_OPEN";
    }
    return this.state;
  }

  canAttempt(): boolean {
    return this.getState() !== "OPEN";
  }

  onSuccess() {
    this.consecutiveFailures = 0;
    this.state = "CLOSED";
    this.openedAt = null;
  }

  onFailure() {
    this.consecutiveFailures += 1;
    if (this.state === "HALF_OPEN" || this.consecutiveFailures >= this.options.failureThreshold) {
      this.state = "OPEN";
      this.openedAt = Date.now();
    }
  }
}
