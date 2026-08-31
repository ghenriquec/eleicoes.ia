import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { syncCandidates } from "../../src/integrations/tse/candidates/candidate-sync";
import { tseLog } from "../../src/integrations/tse/logger";

/**
 * Importação única dos dados REAIS de 2026 (briefing original pedia dado
 * real, não mock — ver conversa). O CDN do TSE está bloqueado neste
 * ambiente; o arquivo foi obtido de uma captura arquivada do próprio CDN
 * oficial (Wayback Machine, 27/08/2026) e passado por caminho local — ver
 * `loadCandidatesZipFromFile`. Isso NÃO substitui o worker de produção
 * (`npm run tse:sync-candidates`), que continua batendo direto no CDN.
 *
 * Uso: npx tsx scripts/tse/import-real-candidates.ts /caminho/para/consulta_cand_2026.zip
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function clearMockAndMigrateData() {
  console.log("Limpando dados de exemplo (mock) antes da importação real...");
  await prisma.candidateResult.deleteMany({});
  await prisma.governmentProposalExcerpt.deleteMany({});
  await prisma.governmentProposal.deleteMany({});
  await prisma.candidateTopicPosition.deleteMany({});
  await prisma.candidateSource.deleteMany({});
  await prisma.candidateDocument.deleteMany({});
  await prisma.candidateSocialNetwork.deleteMany({});
  await prisma.candidateAsset.deleteMany({});
  await prisma.candidate.deleteMany({});
  await prisma.tseCandidateRaw.deleteMany({});
  await prisma.tseImportFile.deleteMany({});
  // Partidos de exemplo (EXP/MOD/TST/AMO/SIM/DEM) — reais serão criados pelo sync.
  await prisma.party.deleteMany({ where: { acronym: { in: ["EXP", "MOD", "TST", "AMO", "SIM", "DEM"] } } });
}

async function main() {
  const localFilePath = process.argv[2];
  if (!localFilePath) {
    console.error("Uso: npx tsx scripts/tse/import-real-candidates.ts <caminho-do-zip>");
    process.exit(1);
  }

  await clearMockAndMigrateData();

  tseLog.info("real_import_start", { source: localFilePath });
  const result = await syncCandidates(2026, localFilePath);
  tseLog.info("real_import_finished", { status: result.status, created: result.recordsCreated, rejected: result.recordsRejected });

  console.log(JSON.stringify(result, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2));
  if (result.status === "FAILED") process.exit(1);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
