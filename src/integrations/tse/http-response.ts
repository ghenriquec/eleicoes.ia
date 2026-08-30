import { NextResponse } from "next/server";
import { ElectionNotYetPublishedError } from "./errors/election-not-published";
import { OfficialResourceNotConfirmedError, TseIntegrationError } from "./errors";

/**
 * Formato de resposta padrão da API interna (briefing "RESILIÊNCIA"): nunca
 * um objeto vazio silencioso, sempre `source`/`updatedAt`/`stale` explícitos.
 */
export function tseJson<T>(data: T, meta: { updatedAt?: Date; stale?: boolean } = {}) {
  return NextResponse.json({
    data,
    source: "TSE",
    updatedAt: (meta.updatedAt ?? new Date()).toISOString(),
    stale: meta.stale ?? false,
  });
}

export function tseErrorResponse(err: unknown) {
  if (err instanceof ElectionNotYetPublishedError) {
    return NextResponse.json(
      { data: null, source: "TSE", updatedAt: new Date().toISOString(), stale: false, message: "Dado ainda não disponibilizado pelo TSE." },
      { status: 200 },
    );
  }
  if (err instanceof OfficialResourceNotConfirmedError) {
    return NextResponse.json(
      { data: null, source: "TSE", updatedAt: new Date().toISOString(), stale: false, message: "Recurso ainda não confirmado — ver docs/tse-integration.md." },
      { status: 501 },
    );
  }
  if (err instanceof TseIntegrationError) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
  return NextResponse.json({ error: "Erro interno." }, { status: 500 });
}
