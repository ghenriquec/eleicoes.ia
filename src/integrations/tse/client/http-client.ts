import { TSE_ALLOWED_HOSTS, TSE_CONFIG } from "../config";
import { TseHostNotAllowedError, TseIntegrationError } from "../errors";

/**
 * Único ponto de saída HTTP para o TSE (briefing "SEGURANÇA" + "ARQUITETURA
 * DE INGESTÃO"). Nunca aceita URL vinda de input de usuário — só as
 * construídas internamente a partir de `TSE_CONFIG`. Garante:
 * - allowlist de host (proteção SSRF)
 * - timeout
 * - User-Agent identificado (nunca se disfarça de navegador)
 * - suporte a cache HTTP condicional (ETag/Last-Modified)
 */

export interface TseFetchOptions {
  etag?: string;
  lastModified?: string;
  timeoutMs?: number;
  responseType?: "json" | "text" | "arraybuffer";
}

export interface TseFetchResult<T> {
  status: number;
  notModified: boolean;
  data: T | null;
  etag: string | null;
  lastModified: string | null;
}

function assertAllowedHost(url: URL) {
  if (!TSE_ALLOWED_HOSTS.has(url.host)) {
    throw new TseHostNotAllowedError(url.host);
  }
}

export async function tseFetch<T = unknown>(url: string, options: TseFetchOptions = {}): Promise<TseFetchResult<T>> {
  const parsed = new URL(url);
  assertAllowedHost(parsed);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? TSE_CONFIG.requestTimeoutMs);

  const headers: Record<string, string> = {
    "User-Agent": "votocerto.ia-tse-integration/1.0 (+https://votocerto.ia; contato via /correcoes)",
    "Accept-Encoding": "gzip, br",
  };
  if (options.etag) headers["If-None-Match"] = options.etag;
  if (options.lastModified) headers["If-Modified-Since"] = options.lastModified;

  try {
    const res = await fetch(parsed.toString(), { headers, signal: controller.signal });

    if (res.status === 304) {
      return { status: 304, notModified: true, data: null, etag: options.etag ?? null, lastModified: options.lastModified ?? null };
    }
    if (!res.ok) {
      throw new TseIntegrationError(`TSE respondeu HTTP ${res.status} para ${parsed.pathname}`, {
        status: res.status,
        url: parsed.toString(),
      });
    }

    const etag = res.headers.get("etag");
    const lastModified = res.headers.get("last-modified");

    let data: T;
    if (options.responseType === "arraybuffer") {
      data = (await res.arrayBuffer()) as T;
    } else if (options.responseType === "text") {
      data = (await res.text()) as T;
    } else {
      data = (await res.json()) as T;
    }

    return { status: res.status, notModified: false, data, etag, lastModified };
  } finally {
    clearTimeout(timeout);
  }
}
