import { prisma } from "@/lib/db/client";
import { downloadCandidatesZip, loadCandidatesZipFromFile, type DownloadedCandidatesFile } from "./fetch-candidates-zip";
import { TSE_CONFIG } from "../config";
import { TseCandidateRowSchema } from "../schemas/candidate.schema";
import { mapCandidateRow, mapRunningMateRow, isViceOfficeRow } from "../mappers/candidate-mapper";
import type { SyncResult, RawRunningMateRecord } from "../types";
import type { SyncError } from "../errors";
import { getCacheProvider } from "../cache";
import { tseLog } from "../logger";

function slugify(name: string, number: string, uf: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + `-${number}-${uf.toLowerCase()}`
  );
}

function birthYearFrom(birthDate: string | null): number | null {
  return birthDate ? Number(birthDate.split("/").pop()) || null : null;
}

/**
 * syncCandidates() — fluxo completo do briefing "SINCRONIZAÇÃO DE
 * CANDIDATOS": metadata → checksum → parse → valida → RAW → normaliza →
 * upsert → SyncResult → invalida cache. Idempotente: arquivo idêntico não é
 * reprocessado.
 *
 * Vice-presidente/vice-governador (DS_CARGO="VICE-PRESIDENTE"/"VICE-GOVERNADOR")
 * nunca viram Candidate — são coletados à parte e casados com o titular no
 * final, por SQ_COLIGACAO (mesma chapa) + UF + cargo. Ver RunningMate no schema.
 */
export async function syncCandidates(electionYear: number, localFilePath?: string): Promise<SyncResult> {
  const startedAt = new Date();
  const errors: SyncError[] = [];
  let recordsCreated = 0;
  let recordsUpdated = 0;
  let recordsRejected = 0;

  let downloaded: DownloadedCandidatesFile;
  try {
    downloaded = localFilePath
      ? await loadCandidatesZipFromFile(localFilePath, `${TSE_CONFIG.candidatesCdnBaseUrl}/consulta_cand_${electionYear}.zip`)
      : await downloadCandidatesZip(electionYear);
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
  const coalitionCache = new Map<string, { id: string }>();
  const round1 = await prisma.electionRound.findFirst({ where: { round: 1, election: { year: electionYear } } });
  const pendingRunningMates: RawRunningMateRecord[] = [];

  for (const row of downloaded.rows) {
    const parsed = TseCandidateRowSchema.safeParse(row);
    if (!parsed.success) {
      recordsRejected++;
      errors.push({ code: "SCHEMA_INVALID", message: "Linha não bateu com o schema esperado.", context: { row } });
      continue;
    }

    if (isViceOfficeRow(parsed.data.DS_CARGO)) {
      pendingRunningMates.push(mapRunningMateRow(parsed.data));
      continue; // não é erro — só não vira Candidate, ver nota da função
    }

    const mapped = mapCandidateRow(parsed.data, downloaded.sourceUrl);
    if (!mapped) continue; // cargo fora do escopo (suplente, prefeito/vereador etc.) — não é erro

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
          update: { acronym: mapped.partyAbbreviation, name: mapped.partyName ?? mapped.partyAbbreviation },
          create: {
            tseNumber: mapped.partyNumber,
            acronym: mapped.partyAbbreviation,
            name: mapped.partyName ?? mapped.partyAbbreviation,
          },
        });
        partyCache.set(mapped.partyNumber, party);
      }

      // toda candidatura tem SQ_COLIGACAO, mesmo "partido isolado" — usado também
      // pra casar vice-presidente/vice-governador com o titular depois do loop.
      let coalition: { id: string } | null = null;
      if (mapped.coalitionSqId) {
        coalition = coalitionCache.get(mapped.coalitionSqId) ?? null;
        if (!coalition) {
          coalition = await prisma.coalition.upsert({
            where: { tseId: mapped.coalitionSqId },
            update: { name: mapped.coalition ?? mapped.coalitionSqId, composition: mapped.coalitionComposition },
            create: { tseId: mapped.coalitionSqId, name: mapped.coalition ?? mapped.coalitionSqId, composition: mapped.coalitionComposition },
          });
          coalitionCache.set(mapped.coalitionSqId, coalition);
        }
      }

      if (!round1) throw new Error(`ElectionRound não seedado para o ano ${electionYear}`);

      const birthYear = birthYearFrom(mapped.birthDate);

      const existing = await prisma.candidate.findUnique({ where: { tseCandidateId: mapped.tseCandidateId } });
      await prisma.candidate.upsert({
        where: { tseCandidateId: mapped.tseCandidateId },
        update: {
          ballotName: mapped.ballotName,
          fullName: mapped.fullName,
          status: mapped.status,
          occupation: mapped.occupation,
          educationLevel: mapped.education,
          birthYear,
          birthDateRaw: mapped.birthDate,
          placeOfBirth: mapped.birthplace,
          nationality: mapped.nationality,
          cpf: mapped.cpf,
          gender: mapped.gender,
          maritalStatus: mapped.maritalStatus,
          raceColor: mapped.raceColor,
          coalitionId: coalition?.id,
          rawDataId: raw.id,
          sourceUpdatedAt: new Date(),
        },
        create: {
          tseCandidateId: mapped.tseCandidateId,
          roundId: round1.id,
          stateId: state.id,
          officeId: office.id,
          partyId: party.id,
          coalitionId: coalition?.id,
          ballotName: mapped.ballotName,
          fullName: mapped.fullName,
          ballotNumber: mapped.ballotNumber,
          slug: slugify(mapped.ballotName, mapped.ballotNumber, mapped.uf),
          status: mapped.status,
          occupation: mapped.occupation,
          educationLevel: mapped.education,
          birthYear,
          birthDateRaw: mapped.birthDate,
          placeOfBirth: mapped.birthplace,
          nationality: mapped.nationality,
          cpf: mapped.cpf,
          gender: mapped.gender,
          maritalStatus: mapped.maritalStatus,
          raceColor: mapped.raceColor,
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

  // Casa cada vice com o titular da mesma chapa (UF + cargo + SQ_COLIGACAO) —
  // feito depois do loop principal porque o vice pode aparecer no CSV antes
  // ou depois do titular, em qualquer ordem.
  let runningMatesLinked = 0;
  for (const vice of pendingRunningMates) {
    if (!vice.coalitionSqId) continue;
    const officeSlug = vice.isPresidentialTicket ? "presidente" : "governador";
    const titular = await prisma.candidate.findFirst({
      where: { state: { uf: vice.uf }, office: { slug: officeSlug }, coalition: { tseId: vice.coalitionSqId } },
      select: { id: true },
    });
    if (!titular) continue; // titular fora do escopo do dataset processado — não é erro

    const birthYear = birthYearFrom(vice.birthDate);
    await prisma.runningMate.upsert({
      where: { candidateId: titular.id },
      update: {
        tseCandidateId: vice.tseCandidateId,
        ballotName: vice.ballotName,
        fullName: vice.fullName,
        ballotNumber: vice.ballotNumber,
        partyAcronym: vice.partyAbbreviation,
        partyName: vice.partyName,
        occupation: vice.occupation,
        educationLevel: vice.education,
        birthYear,
        birthDateRaw: vice.birthDate,
        placeOfBirth: vice.birthplace,
        cpf: vice.cpf,
        gender: vice.gender,
        maritalStatus: vice.maritalStatus,
        raceColor: vice.raceColor,
      },
      create: {
        candidateId: titular.id,
        tseCandidateId: vice.tseCandidateId,
        ballotName: vice.ballotName,
        fullName: vice.fullName,
        ballotNumber: vice.ballotNumber,
        partyAcronym: vice.partyAbbreviation,
        partyName: vice.partyName,
        occupation: vice.occupation,
        educationLevel: vice.education,
        birthYear,
        birthDateRaw: vice.birthDate,
        placeOfBirth: vice.birthplace,
        cpf: vice.cpf,
        gender: vice.gender,
        maritalStatus: vice.maritalStatus,
        raceColor: vice.raceColor,
      },
    });
    runningMatesLinked++;
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
    runningMatesLinked,
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
