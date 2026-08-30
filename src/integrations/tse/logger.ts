/**
 * Logging estruturado (briefing "OBSERVABILIDADE"). JSON em produção
 * (stdout, coletável por qualquer agregador), legível em dev.
 */
type LogFields = Record<string, unknown>;

function emit(level: "info" | "warn" | "error", event: string, fields: LogFields = {}) {
  const entry = { event, level, ts: new Date().toISOString(), ...fields };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const tseLog = {
  info: (event: string, fields?: LogFields) => emit("info", event, fields),
  warn: (event: string, fields?: LogFields) => emit("warn", event, fields),
  error: (event: string, fields?: LogFields) => emit("error", event, fields),
};
