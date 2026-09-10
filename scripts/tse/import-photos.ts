import "dotenv/config";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { prisma } from "../../src/lib/db/client";
import { tseLog } from "../../src/integrations/tse/logger";

/**
 * Importa as fotos oficiais de candidatos (dataset "Fotos de candidatos" do
 * TSE, um ZIP por UF + BR para Presidente). Cada imagem dentro do ZIP se
 * chama `F{UF}{tseCandidateId}_div.jpg` — o mesmo `SQ_CANDIDATO` já
 * armazenado em `Candidate.tseCandidateId`, então o match é direto por
 * nome de arquivo, sem heurística nenhuma.
 *
 * Uso: npx tsx scripts/tse/import-photos.ts <diretório-com-zips>
 */

const PUBLIC_DIR = path.join(process.cwd(), "public", "candidatos");
const FILENAME_RE = /^F([A-Z]{2})(\d+)_div\.jpg$/i;

async function main() {
  const zipsDir = process.argv[2];
  if (!zipsDir) {
    console.error("Uso: npx tsx scripts/tse/import-photos.ts <diretório-com-zips>");
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
    const uf = file.match(/foto_cand2026_([A-Z]{2})_div\.zip/i)?.[1]?.toUpperCase() ?? "XX";
    const buffer = await readFile(path.join(zipsDir, file));
    const zip = await JSZip.loadAsync(buffer);

    const ufDir = path.join(PUBLIC_DIR, uf);
    await mkdir(ufDir, { recursive: true });

    const entries = Object.values(zip.files).filter((f) => !f.dir && FILENAME_RE.test(f.name));
    tseLog.info("photo_zip_opened", { uf, photoCount: entries.length });

    for (const entry of entries) {
      const match = entry.name.match(FILENAME_RE);
      if (!match) continue;
      const tseCandidateId = match[2];

      const candidate = await prisma.candidate.findUnique({
        where: { tseCandidateId },
        select: { id: true },
      });
      if (!candidate) {
        unmatched++;
        continue;
      }

      const destRelative = `/candidatos/${uf}/${tseCandidateId}.jpg`;
      const destPath = path.join(PUBLIC_DIR, uf, `${tseCandidateId}.jpg`);
      const content = await entry.async("nodebuffer");
      await writeFile(destPath, content);
      written++;

      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { photoUrl: destRelative },
      });
      matched++;
    }
  }

  console.log(`Fotos gravadas: ${written} · candidatos vinculados: ${matched} · sem candidato correspondente: ${unmatched}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
