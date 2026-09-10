import "dotenv/config";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { prisma } from "../../src/lib/db/client";
import { tseLog } from "../../src/integrations/tse/logger";

/**
 * Importa os planos de governo oficiais (dataset "Proposta de governo" do
 * TSE — um ZIP por UF + BR, cada um com um PDF por candidato a Presidente/
 * Governador: `{UF}/2026{UF}{tseCandidateId}_01.pdf`). O `SQ_CANDIDATO` no
 * nome do arquivo é o mesmo `Candidate.tseCandidateId` — match direto.
 *
 * O TSE só publica esses PDFs dentro do ZIP (não existe URL individual por
 * candidato no CDN), então extraímos e hospedamos localmente — mesmo
 * tratamento das fotos. `sourceUrl` aponta pro nosso caminho local, que
 * serve o PDF original sem nenhuma alteração; `documentName` guarda o nome
 * original do arquivo pra proveniência.
 *
 * Uso: npx tsx scripts/tse/import-government-proposals.ts <diretório-com-zips>
 */

const PUBLIC_DIR = path.join(process.cwd(), "public", "planos-de-governo");
const FILENAME_RE = /^2026[A-Z]{2}(\d+)_\d+\.pdf$/i;

async function main() {
  const zipsDir = process.argv[2];
  if (!zipsDir) {
    console.error("Uso: npx tsx scripts/tse/import-government-proposals.ts <diretório-com-zips>");
    process.exit(1);
  }

  await mkdir(PUBLIC_DIR, { recursive: true });

  const files = (await readdir(zipsDir)).filter((f) => f.endsWith(".zip"));
  if (files.length === 0) {
    console.error(`Nenhum .zip encontrado em ${zipsDir}`);
    process.exit(1);
  }

  let matched = 0;
  let unmatched = 0;
  let written = 0;

  for (const file of files) {
    const uf = file.match(/proposta_governo_2026_([A-Z]{2})\.zip/i)?.[1]?.toUpperCase() ?? "XX";
    const buffer = await readFile(path.join(zipsDir, file));
    const zip = await JSZip.loadAsync(buffer);

    const ufDir = path.join(PUBLIC_DIR, uf);
    await mkdir(ufDir, { recursive: true });

    const entries = Object.values(zip.files).filter((f) => !f.dir && /\.pdf$/i.test(f.name) && !/leiame/i.test(f.name));
    tseLog.info("proposal_zip_opened", { uf, pdfCount: entries.length });

    for (const entry of entries) {
      const baseName = path.basename(entry.name);
      const match = baseName.match(FILENAME_RE);
      if (!match) {
        unmatched++;
        continue;
      }
      const tseCandidateId = match[1];

      const candidate = await prisma.candidate.findUnique({
        where: { tseCandidateId },
        select: { id: true },
      });
      if (!candidate) {
        unmatched++;
        continue;
      }

      const destRelative = `/planos-de-governo/${uf}/${tseCandidateId}.pdf`;
      const destPath = path.join(PUBLIC_DIR, uf, `${tseCandidateId}.pdf`);
      const content = await entry.async("nodebuffer");
      await writeFile(destPath, content);
      written++;

      await prisma.governmentProposal.upsert({
        where: { candidateId: candidate.id },
        update: { documentName: baseName, sourceUrl: destRelative },
        create: { candidateId: candidate.id, documentName: baseName, sourceUrl: destRelative },
      });
      matched++;
    }
  }

  console.log(`PDFs gravados: ${written} · candidatos vinculados: ${matched} · sem candidato correspondente: ${unmatched}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
