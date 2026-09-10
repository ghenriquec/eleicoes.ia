import "dotenv/config";
import { syncAssets } from "../../src/integrations/tse/assets-declaration/asset-sync";
import { tseLog } from "../../src/integrations/tse/logger";
import { prisma } from "../../src/lib/db/client";

/**
 * Importação única dos bens declarados reais de 2026 (`bem_candidato_2026.zip`,
 * mesma pasta `odsele` dos candidatos). O CDN do TSE está bloqueado neste
 * ambiente; o arquivo foi obtido de uma captura arquivada do próprio CDN
 * oficial (Wayback Machine, 26/08/2026) e passado por caminho local — ver
 * `loadAssetsZipFromFile`. Isso NÃO substitui o worker de produção, que
 * bateria direto no CDN.
 *
 * Uso: npx tsx scripts/tse/import-real-assets.ts /caminho/para/bem_candidato_2026.zip
 */

async function main() {
  const localFilePath = process.argv[2];
  if (!localFilePath) {
    console.error("Uso: npx tsx scripts/tse/import-real-assets.ts <caminho-do-zip>");
    process.exit(1);
  }

  tseLog.info("real_asset_import_start", { source: localFilePath });
  const result = await syncAssets(2026, localFilePath);
  tseLog.info("real_asset_import_finished", { status: result.status, created: result.recordsCreated, rejected: result.recordsRejected });

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
