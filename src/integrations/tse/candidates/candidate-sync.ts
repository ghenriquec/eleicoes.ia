import { prisma } from "@/lib/db/client";
import { downloadCandidatesZip } from "./fetch-candidates-zip";
import { TseCandidateRowSchema } from "../schemas/candidate.schema";
import { mapCandidateRow } from "../mappers/candidate-mapper";
import type { SyncResult } from "../types";
import type { SyncError } from "../errors";
import { getCacheProvider } from "../cache";
import { tseLog } from "../logger";

function slugify(name: string, number: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + `-${number}`
  );
}

/**
 * syncCandidates() — fluxo completo do briefing "SINCRONIZAÇÃO DE
 * CANDIDATOS": metadata → checksum → parse → valida → RAW → normaliza →
 * upsert → SyncResult → invalida cache. Idempotente: arquivo idêntico não é
 * reprocessado.
 */
export async function syncCandidates(electionYear: number): Promise<SyncResult> {
  const startedAt = new Date();
  const errors: SyncError[] = [];
  let recordsCreated = 0;
  let recordsUpdated = 0;
  let recordsRejected = 0;

  let downloaded;
  try {
    downloaded = await downloadCandidatesZip(electionYear);
  } catch (err) {
    return {
      status: "FAILED",
      source: "TSE CDN — consulta_cand",
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
    where: { dataset: "consulta_cand", electionYear },
    orderBy: { downloadedAt: "desc" },
  });
  if (lastImport && lastImport.checksum === downloaded.checksum) {
    return {
      status: "UNCHANGED",
      source: "TSE CDN — consulta_cand",
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
      dataset: "consulta_cand",
      resourceName: "Candidatos",
      resourceUrl: downloaded.sourceUrl,
      electionYear,
      fileName: downloaded.fileName,
      mimeType: downloaded.mimeType,
      checksum: downloaded.checksum,
      status: "DOWNLOADED",
    },
  });

  const officeCache = new Map<string, { id: string }>();
  const stateCache = new Map<string, { id: string }>();
  const partyCache = new Map<number, { id: string }>();
  const round1 = await prisma.electionRound.findFirst({ where: { round: 1, election: { year: electionYear } } });

  for (const row of downloaded.rows) {
    const parsed = TseCandidateRowSchema.safeParse(row);
    if (!parsed.success) {
      recordsRejected++;
      errors.push({ code: "SCHEMA_INVALID", message: "Linha não bateu com o schema esperado.", context: { row } });
      continue;
    }

    const mapped = mapCandidateRow(parsed.data, downloaded.sourceUrl);
    if (!mapped) continue; // cargo fora do escopo (prefeito/vereador etc.) — não é erro

    try {
      const raw = await prisma.tseCandidateRaw.create({
        data: {
          importFileId: importFile.id,
          tseCandidateId: mapped.tseCandidateId,
          electionYear: mapped.electionYear,
          payloadJson: mapped.raw,
          sourceUrl: mapped.sourceUrl,
          checksum: downloaded.checksum,
        },
      });

      let office = officeCache.get(mapped.office);
      if (!office) {
        const found = await prisma.office.findFirst({ where: { slug: officeSlugFor(mapped.office) } });
        if (!found) throw new Error(`Cargo interno não seedado: ${mapped.office}`);
        office = found;
        officeCache.set(mapped.office, office);
      }

      let state = stateCache.get(mapped.uf);
      if (!state) {
        const found = await prisma.state.findUnique({ where: { uf: mapped.uf } });
        if (!found) throw new Error(`UF desconhecida: ${mapped.uf}`);
        state = found;
        stateCache.set(mapped.uf, state);
      }

      let party = partyCache.get(mapped.partyNumber);
      if (!party) {
        party = await prisma.party.upsert({
          where: { tseNumber: mapped.partyNumber },
          update: { acronym: mapped.partyAbbreviation },
          create: { tseNumber: mapped.partyNumber, acronym: mapped.partyAbbreviation, name: mapped.partyAbbreviation },
        });
        partyCache.set(mapped.partyNumber, party);
      }

      if (!round1) throw new Error(`ElectionRound não seedado para o ano ${electionYear}`);

      const existing = await prisma.candidate.findUnique({ where: { tseCandidateId: mapped.tseCandidateId } });
      await prisma.candidate.upsert({
        where: { tseCandidateId: mapped.tseCandidateId },
        update: {
          ballotName: mapped.ballotName,
          fullName: mapped.fullName,
          status: mapped.status,
          occupation: mapped.occupation,
          educationLevel: mapped.education,
          rawDataId: raw.id,
          sourceUpdatedAt: new Date(),
        },
        create: {
          tseCandidateId: mapped.tseCandidateId,
          roundId: round1.id,
          stateId: state.id,
          officeId: office.id,
          partyId: party.id,
          ballotName: mapped.ballotName,
          fullName: mapped.fullName,
          ballotNumber: mapped.ballotNumber,
          slug: slugify(mapped.ballotName, mapped.ballotNumber),
          status: mapped.status,
          occupation: mapped.occupation,
          educationLevel: mapped.education,
          nationality: mapped.nationality,
          isMockData: false,
          rawDataId: raw.id,
          sourceUpdatedAt: new Date(),
        },
      });

      if (existing) recordsUpdated++;
      else recordsCreated++;
    } catch (err) {
      recordsRejected++;
      errors.push({
        code: "UPSERT_FAILED",
        message: err instanceof Error ? err.message : String(err),
        context: { tseCandidateId: mapped.tseCandidateId },
      });
    }
  }

  await prisma.tseImportFile.update({ where: { id: importFile.id }, data: { status: "PROCESSED" } });

  const cache = getCacheProvider();
  await cache.del("candidates:list");

  const status: SyncResult["status"] = recordsRejected === 0 ? "SUCCESS" : recordsCreated + recordsUpdated > 0 ? "PARTIAL" : "FAILED";

  await prisma.dataSyncLog.create({
    data: {
      source: "TSE CDN — consulta_cand",
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
    resource: "candidates",
    status,
    durationMs: Date.now() - startedAt.getTime(),
    records: downloaded.rows.length,
    created: recordsCreated,
    updated: recordsUpdated,
    rejected: recordsRejected,
  });

  return {
    status,
    source: "TSE CDN — consulta_cand",
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

function officeSlugFor(office: string): string {
  const map: Record<string, string> = {
    PRESIDENT: "presidente",
    GOVERNOR: "governador",
    SENATOR: "senador",
    FEDERAL_DEPUTY: "deputado-federal",
    STATE_DEPUTY: "deputado-estadual",
    DISTRICT_DEPUTY: "deputado-distrital",
  };
  return map[office] ?? office.toLowerCase();
}
