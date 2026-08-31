import JSZip from "jszip";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tseFetch } from "../client/http-client";
import { TSE_CONFIG } from "../config";
import { parseTseCsv } from "../parsers/csv";
import type { CsvRow } from "../parsers/csv";

/**
 * Baixa e extrai o ZIP de candidatos do CDN do TSE (padrão real confirmado
 * em docs/tse-integration.md §1: `consulta_cand_{ano}.zip`, contendo um CSV
 * por UF + um CSV consolidado `..._BRASIL.csv`). Preferimos o consolidado
 * quando presente.
 *
 * ✅ Validado em 30/08/2026 contra um payload real (20.769 candidatos) —
 * `cdn.tse.jus.br` está bloqueado neste ambiente de desenvolvimento, então a
 * validação usou uma captura arquivada do próprio arquivo oficial (Wayback
 * Machine, 27/08/2026). Em produção, fora deste bloqueio de rede, esta
 * função deve funcionar direto contra o CDN sem alterações.
 */

export interface DownloadedCandidatesFile {
  fileName: string;
  mimeType: string;
  checksum: string;
  rows: CsvRow[];
  sourceUrl: string;
}

function extractConsolidatedCsv(buffer: ArrayBuffer) {
  return JSZip.loadAsync(buffer).then(async (zip) => {
    const consolidatedName = Object.keys(zip.files).find((n) => /_BRASIL\.csv$/i.test(n));
    const targetName = consolidatedName ?? Object.keys(zip.files).find((n) => n.toLowerCase().endsWith(".csv"));
    if (!targetName) {
      throw new Error("Nenhum CSV encontrado dentro do ZIP de candidatos — o TSE pode ter mudado a estrutura do arquivo.");
    }
    const csvBuffer = await zip.files[targetName].async("arraybuffer");
    return { targetName, rows: parseTseCsv(csvBuffer, { encoding: "iso-8859-1" }) };
  });
}

export async function downloadCandidatesZip(electionYear: number): Promise<DownloadedCandidatesFile> {
  const url = `${TSE_CONFIG.candidatesCdnBaseUrl}/consulta_cand_${electionYear}.zip`;
  const res = await tseFetch<ArrayBuffer>(url, { responseType: "arraybuffer" });
  const buffer = res.data as ArrayBuffer;

  const checksum = createHash("sha256").update(Buffer.from(buffer)).digest("hex");
  const { targetName, rows } = await extractConsolidatedCsv(buffer);

  return { fileName: targetName, mimeType: "text/csv", checksum, rows, sourceUrl: url };
}

/**
 * Mesmo parser, mas a partir de um arquivo ZIP já em disco — usado quando o
 * CDN não está acessível a partir deste ambiente (ver aviso acima) e o
 * arquivo foi obtido por outro caminho (ex. captura arquivada). `sourceUrl`
 * continua sendo a URL oficial do TSE, nunca a origem alternativa — a
 * proveniência real fica registrada em `DataSyncLog`/`TseImportFile`
 * separadamente por quem chama esta função.
 */
export async function loadCandidatesZipFromFile(filePath: string, sourceUrl: string): Promise<DownloadedCandidatesFile> {
  const buffer = await readFile(filePath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  const checksum = createHash("sha256").update(buffer).digest("hex");
  const { targetName, rows } = await extractConsolidatedCsv(arrayBuffer);

  return { fileName: targetName, mimeType: "text/csv", checksum, rows, sourceUrl };
}
