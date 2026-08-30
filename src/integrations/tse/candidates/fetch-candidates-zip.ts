import JSZip from "jszip";
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
 * ⚠️ Nunca executado com sucesso nesta sessão (cdn.tse.jus.br bloqueado —
 * ver docs/tse-integration.md). Implementado contra o padrão confirmado por
 * pesquisa; precisa de validação numa rede sem esse bloqueio.
 */

export interface DownloadedCandidatesFile {
  fileName: string;
  mimeType: string;
  checksum: string;
  rows: CsvRow[];
  sourceUrl: string;
}

export async function downloadCandidatesZip(electionYear: number): Promise<DownloadedCandidatesFile> {
  const url = `${TSE_CONFIG.candidatesCdnBaseUrl}/consulta_cand_${electionYear}.zip`;
  const res = await tseFetch<ArrayBuffer>(url, { responseType: "arraybuffer" });
  const buffer = res.data as ArrayBuffer;

  const checksum = createHash("sha256").update(Buffer.from(buffer)).digest("hex");

  const zip = await JSZip.loadAsync(buffer);
  const consolidatedName = Object.keys(zip.files).find((n) => /_BRASIL\.csv$/i.test(n));
  const targetName = consolidatedName ?? Object.keys(zip.files).find((n) => n.toLowerCase().endsWith(".csv"));
  if (!targetName) {
    throw new Error(`Nenhum CSV encontrado dentro de ${url} — o TSE pode ter mudado a estrutura do ZIP.`);
  }

  const csvBuffer = await zip.files[targetName].async("arraybuffer");
  const rows = parseTseCsv(csvBuffer, { encoding: "iso-8859-1" });

  return { fileName: targetName, mimeType: "text/csv", checksum, rows, sourceUrl: url };
}
