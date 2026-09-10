import "dotenv/config";
import { readFile } from "node:fs/promises";
import { prisma } from "../../src/lib/db/client";

/**
 * Importa UMA pesquisa eleitoral a partir de um JSON verificado manualmente
 * (ver docs/tse-integration.md §9 pra explicação completa). Não existe
 * scraper automático aqui de propósito: os institutos/veículos que
 * publicam esses números não expõem um feed público destinado a reuso por
 * terceiros — cada pesquisa entra só depois de alguém confirmar o número
 * contra a publicação original (site do instituto ou matéria de imprensa)
 * e preencher `sourceUrl` com essa publicação.
 *
 * Formato do JSON (ver scripts/tse/polls/*.json pra exemplos reais):
 * {
 *   "institute": "Datafolha",
 *   "office": "presidente",
 *   "uf": "BR",
 *   "round": 1,
 *   "questionType": "Estimulada",
 *   "fieldworkStart": "2026-08-30",
 *   "fieldworkEnd": "2026-09-03",
 *   "publishedAt": "2026-09-03",
 *   "sampleSize": 2500,
 *   "marginOfError": 2,
 *   "sourceName": "G1 (dados: Datafolha)",
 *   "sourceUrl": "https://g1.globo.com/...",
 *   "results": [
 *     { "candidateName": "Lula", "partyAcronym": "PT", "percentage": 38 },
 *     { "candidateName": "Indecisos", "percentage": 3 }
 *   ]
 * }
 *
 * Uso: npx tsx scripts/tse/import-poll.ts <caminho-do-json>
 */

interface PollResultInput {
  candidateName: string;
  partyAcronym?: string;
  percentage: number;
}

interface PollInput {
  institute: string;
  office: "presidente" | "governador";
  uf: string;
  round: number;
  questionType: string;
  fieldworkStart?: string;
  fieldworkEnd?: string;
  publishedAt: string;
  sampleSize?: number;
  marginOfError?: number;
  sourceName: string;
  sourceUrl: string;
  results: PollResultInput[];
}

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error("Uso: npx tsx scripts/tse/import-poll.ts <caminho-do-json>");
    process.exit(1);
  }

  const input = JSON.parse(await readFile(jsonPath, "utf-8")) as PollInput;

  const poll = await prisma.poll.create({
    data: {
      institute: input.institute,
      office: input.office,
      uf: input.uf.toUpperCase(),
      round: input.round,
      questionType: input.questionType,
      fieldworkStart: input.fieldworkStart ? new Date(input.fieldworkStart) : null,
      fieldworkEnd: input.fieldworkEnd ? new Date(input.fieldworkEnd) : null,
      publishedAt: new Date(input.publishedAt),
      sampleSize: input.sampleSize ?? null,
      marginOfError: input.marginOfError ?? null,
      sourceName: input.sourceName,
      sourceUrl: input.sourceUrl,
    },
  });

  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toUpperCase()
      .trim();

  const officeCandidates = await prisma.candidate.findMany({
    where: { office: { slug: input.office } },
    select: { id: true, ballotName: true, fullName: true },
  });

  let matched = 0;
  for (const r of input.results) {
    // Casa pelo nome de urna real, ignorando acento/caixa e permitindo que
    // um lado seja um "apelido" do outro (ex.: instituto publica "Zema", TSE
    // registra "ROMEU ZEMA NETO") — checa em ambas as direções. Se não achar,
    // guarda sem candidateId (ainda mostrável, só sem foto/link pro perfil).
    // Nunca inventa o vínculo quando não há correspondência clara.
    const target = normalize(r.candidateName);
    const candidate = officeCandidates.find((c) => {
      const ballot = normalize(c.ballotName);
      const full = normalize(c.fullName);
      return (
        ballot === target ||
        full === target ||
        ballot.includes(target) ||
        target.includes(ballot) ||
        full.includes(target)
      );
    });
    if (candidate) matched++;

    await prisma.pollResult.create({
      data: {
        pollId: poll.id,
        candidateName: r.candidateName,
        partyAcronym: r.partyAcronym ?? null,
        percentage: r.percentage,
        candidateId: candidate?.id ?? null,
      },
    });
  }

  console.log(`Pesquisa importada: ${input.institute} · ${input.office}/${input.uf} · ${input.results.length} linhas (${matched} casadas com candidato real)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
