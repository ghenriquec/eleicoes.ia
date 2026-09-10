import "dotenv/config";
import { syncCandidates } from "../../src/integrations/tse/candidates/candidate-sync";
import { tseLog } from "../../src/integrations/tse/logger";
import { prisma } from "../../src/lib/db/client";

/**
 * Re-sincroniza candidatos SEM apagar nada primeiro — ao contrário de
 * import-real-candidates.ts (que existe só pro bootstrap inicial, quando
 * ainda havia dado de exemplo pra limpar). `syncCandidates()` já faz upsert
 * por `tseCandidateId`: candidato existente é atualizado no lugar (mesmo
 * `id`), preservando fotos/bens/redes sociais/propostas já vinculados.
 *
 * Apaga só o registro de `TseImportFile` anterior (não o dado em si) antes
 * de sincronizar — nesta rodada o arquivo baixado tem o mesmo checksum do
 * import original, mas o MAPEAMENTO mudou (novos campos pessoais, vínculo
 * de vice), então precisa reprocessar mesmo sem mudança no arquivo fonte.
 *
 * Uso: npx tsx scripts/tse/resync-candidates.ts <caminho-do-zip>
 */

async function main() {
  const localFilePath = process.argv[2];
  if (!localFilePath) {
    console.error("Uso: npx tsx scripts/tse/resync-candidates.ts <caminho-do-zip>");
    process.exit(1);
  }

  // Invalida o checksum em vez de apagar a linha — TseCandidateRaw referencia
  // TseImportFile por FK opcional, sem necessidade de arriscar um cascade.
  const invalidated = await prisma.tseImportFile.updateMany({
    where: { dataset: "consulta_cand" },
    data: { checksum: "invalidated-for-schema-resync" },
  });
  tseLog.info("candidate_resync_invalidated_import_marker", { count: invalidated.count });

  tseLog.info("candidate_resync_start", { source: localFilePath });
  const result = await syncCandidates(2026, localFilePath);
  tseLog.info("candidate_resync_finished", { status: result.status, created: result.recordsCreated, updated: result.recordsUpdated, rejected: result.recordsRejected });

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
