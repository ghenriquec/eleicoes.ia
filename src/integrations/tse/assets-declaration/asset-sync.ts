import { prisma } from "@/lib/db/client";
import { downloadAssetsZip, loadAssetsZipFromFile, type DownloadedAssetsFile } from "./fetch-assets-zip";
import { TseAssetRowSchema } from "../schemas/candidate.schema";
import { mapAssetRow } from "../mappers/candidate-mapper";
import { TSE_CONFIG } from "../config";
import type { SyncResult } from "../types";
import type { SyncError } from "../errors";
import { tseLog } from "../logger";

/**
 * syncAssets() — mesmo fluxo de syncCandidates() (docs/tse-integration.md §5):
 * baixa/lê o ZIP → valida contra o schema → mapeia → casa por
 * `SQ_CANDIDATO` (== `Candidate.tseCandidateId`) → cria os bens. Candidatos
 * fora do nosso escopo (vice, suplente, prefeito/vereador etc., já
 * filtrados por `syncCandidates`) simplesmente não têm candidato
 * correspondente — não é erro, só não geram bem.
 *
 * Idempotência: como `CandidateAsset` não tem chave natural (um candidato
 * pode ter várias linhas do mesmo bem), a proteção é por arquivo — mesmo
 * checksum já processado é pulado, igual ao fluxo de candidatos.
 */
export async function syncAssets(electionYear: number, localFilePath?: string): Promise<SyncResult> {
  const startedAt = new Date();
  const errors: SyncError[] = [];
  let recordsCreated = 0;
  const recordsUpdated = 0;
  let recordsRejected = 0;

  let downloaded: DownloadedAssetsFile;
  try {
    downloaded = localFilePath
      ? await loadAssetsZipFromFile(localFilePath, `${TSE_CONFIG.assetsCdnBaseUrl}/bem_candidato_${electionYear}.zip`)
      : await downloadAssetsZip(electionYear);
  } catch (err) {
    return {
      status: "FAILED",
      source: "TSE CDN — bem_candidato",
      startedAt,
      finishedAt: new Date(),
      recordsReceived: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsRejected: 0,
      errors: [{ code: "DOWNLOAD_FAILED", message: err instanceof Error ? err.message : String(err) }],
    };
  }

  const lastImport = await prisma.tseImportFile.findFirst({
    where: { dataset: "bem_candidato", electionYear },
    orderBy: { downloadedAt: "desc" },
  });
  if (lastImport && lastImport.checksum === downloaded.checksum) {
    return {
      status: "UNCHANGED",
      source: "TSE CDN — bem_candidato",
      startedAt,
      finishedAt: new Date(),
      recordsReceived: downloaded.rows.length,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsRejected: 0,
      checksum: downloaded.checksum,
      errors: [],
    };
  }

  const importFile = await prisma.tseImportFile.create({
    data: {
      dataset: "bem_candidato",
      resourceName: "Bens de candidatos",
      resourceUrl: downloaded.sourceUrl,
      electionYear,
      fileName: downloaded.fileName,
      mimeType: downloaded.mimeType,
      checksum: downloaded.checksum,
      status: "DOWNLOADED",
    },
  });

  const candidateCache = new Map<string, { id: string } | null>();

  for (const row of downloaded.rows) {
    const parsed = TseAssetRowSchema.safeParse(row);
    if (!parsed.success) {
      recordsRejected++;
      errors.push({ code: "SCHEMA_INVALID", message: "Linha não bateu com o schema esperado.", context: { row } });
      continue;
    }

    const tseCandidateId = parsed.data.SQ_CANDIDATO;
    let candidate = candidateCache.get(tseCandidateId);
    if (candidate === undefined) {
      candidate = await prisma.candidate.findUnique({ where: { tseCandidateId }, select: { id: true } });
      candidateCache.set(tseCandidateId, candidate);
    }
    if (!candidate) continue; // candidato fora do escopo do site (não é erro — ver nota acima)

    try {
      const mapped = mapAssetRow(parsed.data);
      await prisma.candidateAsset.create({
        data: {
          candidateId: candidate.id,
          assetType: mapped.assetType,
          description: mapped.description,
          valueCents: mapped.valueCents,
        },
      });
      recordsCreated++;
    } catch (err) {
      recordsRejected++;
      errors.push({
        code: "INSERT_FAILED",
        message: err instanceof Error ? err.message : String(err),
        context: { tseCandidateId },
      });
    }
  }

  await prisma.tseImportFile.update({ where: { id: importFile.id }, data: { status: "PROCESSED" } });

  const status: SyncResult["status"] = recordsRejected === 0 ? "SUCCESS" : recordsCreated > 0 ? "PARTIAL" : "FAILED";

  await prisma.dataSyncLog.create({
    data: {
      source: "TSE CDN — bem_candidato",
      sourceUrl: downloaded.sourceUrl,
      startedAt,
      finishedAt: new Date(),
      status,
      recordsReceived: downloaded.rows.length,
      recordsCreated,
      recordsUpdated,
      recordsRejected,
      checksum: downloaded.checksum,
      errors: errors.length > 0 ? (JSON.parse(JSON.stringify(errors)) as object[]) : undefined,
    },
  });

  tseLog.info("tse_resource_sync", {
    resource: "assets",
    status,
    durationMs: Date.now() - startedAt.getTime(),
    records: downloaded.rows.length,
    created: recordsCreated,
    rejected: recordsRejected,
  });

  return {
    status,
    source: "TSE CDN — bem_candidato",
    startedAt,
    finishedAt: new Date(),
    recordsReceived: downloaded.rows.length,
    recordsCreated,
    recordsUpdated,
    recordsRejected,
    checksum: downloaded.checksum,
    errors,
  };
}
