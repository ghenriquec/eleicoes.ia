import "dotenv/config";
import { syncSocialNetworks } from "../../src/integrations/tse/social-networks/social-network-sync";
import { tseLog } from "../../src/integrations/tse/logger";
import { prisma } from "../../src/lib/db/client";

/**
 * Importação única das redes sociais reais de 2026
 * (`rede_social_candidato_2026.zip`, mesma pasta `consulta_cand` dos
 * candidatos). O CDN do TSE está bloqueado neste ambiente; o arquivo foi
 * obtido de uma captura arquivada do próprio CDN oficial (Wayback Machine,
 * 17/08/2026) e passado por caminho local — ver
 * `loadSocialNetworksZipFromFile`.
 *
 * Uso: npx tsx scripts/tse/import-real-social-networks.ts /caminho/para/rede_social_candidato_2026.zip
 */

async function main() {
  const localFilePath = process.argv[2];
  if (!localFilePath) {
    console.error("Uso: npx tsx scripts/tse/import-real-social-networks.ts <caminho-do-zip>");
    process.exit(1);
  }

  tseLog.info("real_social_network_import_start", { source: localFilePath });
  const result = await syncSocialNetworks(2026, localFilePath);
  tseLog.info("real_social_network_import_finished", { status: result.status, created: result.recordsCreated, rejected: result.recordsRejected });

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
