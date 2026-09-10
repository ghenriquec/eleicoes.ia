import { prisma } from "@/lib/db/client";
import { downloadSocialNetworksZip, loadSocialNetworksZipFromFile, type DownloadedSocialNetworksFile } from "./fetch-social-networks-zip";
import { TseSocialNetworkRowSchema } from "../schemas/candidate.schema";
import { normalizeSocialUrl } from "./normalize-url";
import { TSE_CONFIG } from "../config";
import type { SyncResult } from "../types";
import type { SyncError } from "../errors";
import { tseLog } from "../logger";

/**
 * syncSocialNetworks() — mesmo fluxo de syncAssets() (docs/tse-integration.md
 * §5): baixa/lê o ZIP → valida contra o schema → casa por `SQ_CANDIDATO` →
 * normaliza a URL (`normalizeSocialUrl` — campo de texto livre, ver nota lá)
 * → cria a rede social. Linha sem candidato correspondente ou sem URL
 * navegável não é erro, só não gera registro.
 */
export async function syncSocialNetworks(electionYear: number, localFilePath?: string): Promise<SyncResult> {
  const startedAt = new Date();
  const errors: SyncError[] = [];
  let recordsCreated = 0;
  const recordsUpdated = 0;
  let recordsRejected = 0;

  let downloaded: DownloadedSocialNetworksFile;
  try {
    downloaded = localFilePath
      ? await loadSocialNetworksZipFromFile(localFilePath, `${TSE_CONFIG.socialNetworksCdnBaseUrl}/rede_social_candidato_${electionYear}.zip`)
      : await downloadSocialNetworksZip(electionYear);
  } catch (err) {
    return {
      status: "FAILED",
      source: "TSE CDN — rede_social_candidato",
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
    where: { dataset: "rede_social_candidato", electionYear },
    orderBy: { downloadedAt: "desc" },
  });
  if (lastImport && lastImport.checksum === downloaded.checksum) {
    return {
      status: "UNCHANGED",
      source: "TSE CDN — rede_social_candidato",
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
      dataset: "rede_social_candidato",
      resourceName: "Redes sociais de candidatos",
      resourceUrl: downloaded.sourceUrl,
      electionYear,
      fileName: downloaded.fileName,
      mimeType: downloaded.mimeType,
      checksum: downloaded.checksum,
      status: "DOWNLOADED",
    },
  });

  const candidateCache = new Map<string, { id: string } | null>();
  // uma URL por candidato só uma vez — o TSE tem candidatos repetindo a mesma rede em várias linhas
  const seen = new Set<string>();

  for (const row of downloaded.rows) {
    const parsed = TseSocialNetworkRowSchema.safeParse(row);
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
    if (!candidate) continue; // candidato fora do escopo do site — não é erro

    const normalized = normalizeSocialUrl(parsed.data.DS_URL);
    if (!normalized) continue; // texto livre sem URL navegável — não é erro, ver normalize-url.ts

    const dedupeKey = `${candidate.id}::${normalized.url}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    try {
      await prisma.candidateSocialNetwork.create({
        data: { candidateId: candidate.id, platform: normalized.platform, url: normalized.url },
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
      source: "TSE CDN — rede_social_candidato",
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
    resource: "social_networks",
    status,
    durationMs: Date.now() - startedAt.getTime(),
    records: downloaded.rows.length,
    created: recordsCreated,
    rejected: recordsRejected,
  });

  return {
    status,
    source: "TSE CDN — rede_social_candidato",
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
