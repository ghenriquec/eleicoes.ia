export class TseIntegrationError extends Error {
  constructor(
    message: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "TseIntegrationError";
  }
}

/** Um schema não bateu com o que o TSE devolveu — nunca vira zero/vazio silenciosamente. */
export class TseSchemaValidationError extends TseIntegrationError {
  constructor(resource: string, issues: unknown) {
    super(`Schema do TSE mudou ou é inválido para "${resource}".`, { resource, issues });
    this.name = "TseSchemaValidationError";
  }
}

/** Host fora da allowlist — proteção contra SSRF. */
export class TseHostNotAllowedError extends TseIntegrationError {
  constructor(host: string) {
    super(`Host "${host}" não está na allowlist de integração com o TSE.`, { host });
    this.name = "TseHostNotAllowedError";
  }
}

/** URL/endpoint cuja especificação ainda não foi confirmada — ver docs/tse-integration.md. */
export class OfficialResourceNotConfirmedError extends TseIntegrationError {
  constructor(resource: string) {
    super(
      `A especificação oficial de "${resource}" ainda não foi confirmada contra um payload real do TSE. ` +
        `Ver docs/tse-integration.md antes de habilitar em produção.`,
      { resource },
    );
    this.name = "OfficialResourceNotConfirmedError";
  }
}

export class TseCircuitOpenError extends TseIntegrationError {
  constructor(resource: string) {
    super(`Circuit breaker aberto para "${resource}" — servindo último snapshot válido.`, { resource });
    this.name = "TseCircuitOpenError";
  }
}

export interface SyncError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
}
