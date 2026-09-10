import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tseFetch } from "../client/http-client";
import { TSE_CONFIG } from "../config";
import { extractConsolidatedCsv } from "../candidates/fetch-candidates-zip";
import type { CsvRow } from "../parsers/csv";

/**
 * Baixa e extrai o ZIP de redes sociais do CDN do TSE
 * (`rede_social_candidato_{ano}.zip`, mesma pasta `consulta_cand`, mesmo
 * padrão de arquivo: um CSV por UF + `_BRASIL.csv` consolidado). Confirmado
 * contra um payload real em 30/08/2026 — ver docs/tse-integration.md §5.
 */

export interface DownloadedSocialNetworksFile {
  fileName: string;
  mimeType: string;
  checksum: string;
  rows: CsvRow[];
  sourceUrl: string;
}

export async function downloadSocialNetworksZip(electionYear: number): Promise<DownloadedSocialNetworksFile> {
  const url = `${TSE_CONFIG.socialNetworksCdnBaseUrl}/rede_social_candidato_${electionYear}.zip`;
  const res = await tseFetch<ArrayBuffer>(url, { responseType: "arraybuffer" });
  const buffer = res.data as ArrayBuffer;

  const checksum = createHash("sha256").update(Buffer.from(buffer)).digest("hex");
  const { targetName, rows } = await extractConsolidatedCsv(buffer);

  return { fileName: targetName, mimeType: "text/csv", checksum, rows, sourceUrl: url };
}

/** Mesmo parser, a partir de um ZIP já em disco — ver nota equivalente em fetch-candidates-zip.ts. */
export async function loadSocialNetworksZipFromFile(filePath: string, sourceUrl: string): Promise<DownloadedSocialNetworksFile> {
  const buffer = await readFile(filePath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  const checksum = createHash("sha256").update(buffer).digest("hex");
  const { targetName, rows } = await extractConsolidatedCsv(arrayBuffer);

  return { fileName: targetName, mimeType: "text/csv", checksum, rows, sourceUrl };
}
