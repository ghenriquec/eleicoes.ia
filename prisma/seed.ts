import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { STATES } from "../src/lib/domain/states";
import { OFFICES } from "../src/lib/domain/offices";
import { MOCK_PARTIES, generateMockCandidates } from "../src/lib/tse-client/mock-data";
import { TOPICS, QUESTIONS } from "../src/lib/quiz/content";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_STATES = ["MG", "SP", "DF", "BA", "RS"];

function slugify(text: string, suffix: string) {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + `-${suffix}`
  );
}

async function main() {
  console.log("Semeando votocerto.ia (dados de EXEMPLO, nao oficiais) ...");

  const election = await prisma.election.upsert({
    where: { year: 2026 },
    update: {},
    create: { year: 2026 },
  });
  const round1 = await prisma.electionRound.upsert({
    where: { electionId_round: { electionId: election.id, round: 1 } },
    update: {},
    create: { electionId: election.id, round: 1, votingDate: new Date("2026-10-04T08:00:00-03:00") },
  });

  for (const s of STATES) {
    await prisma.state.upsert({ where: { uf: s.uf }, update: { name: s.name }, create: { uf: s.uf, name: s.name } });
  }
  // "BR" pseudo-estado para a corrida presidencial (escopo nacional).
  await prisma.state.upsert({ where: { uf: "BR" }, update: {}, create: { uf: "BR", name: "Brasil" } });

  for (const o of OFFICES) {
    await prisma.office.upsert({ where: { slug: o.slug }, update: { name: o.name }, create: { slug: o.slug, name: o.name } });
  }

  const partyRecords = await Promise.all(
    MOCK_PARTIES.map((p) =>
      prisma.party.upsert({
        where: { tseNumber: p.tseNumber },
        update: { acronym: p.acronym, name: p.name },
        create: { tseNumber: p.tseNumber, acronym: p.acronym, name: p.name },
      }),
    ),
  );

  // ---- Quiz: tópicos e perguntas ----
  const topicByslug = new Map<string, { id: string }>();
  for (const t of TOPICS) {
    const rec = await prisma.topic.upsert({ where: { slug: t.slug }, update: { name: t.name }, create: { slug: t.slug, name: t.name } });
    topicByslug.set(t.slug, rec);
  }

  const createdQuestions: { id: string; topicSlug: string }[] = [];
  // Limpa perguntas antigas para permitir reseed idempotente em dev.
  await prisma.candidateTopicPosition.deleteMany({});
  await prisma.quizAnswerOption.deleteMany({});
  await prisma.quizQuestion.deleteMany({});

  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    const topic = topicByslug.get(q.topicSlug);
    if (!topic) throw new Error(`Tópico desconhecido: ${q.topicSlug}`);
    const question = await prisma.quizQuestion.create({
      data: {
        topicId: topic.id,
        text: q.text,
        explanation: q.explanation ?? null,
        order: i,
        options: {
          create: q.options.map((o, idx) => ({ text: o.text, normalizedPosition: o.normalizedPosition, order: idx })),
        },
      },
      include: { options: true },
    });
    createdQuestions.push({ id: question.id, topicSlug: q.topicSlug });
  }

  // ---- Candidatos MOCK ----
  await prisma.candidateResult.deleteMany({});
  await prisma.governmentProposalExcerpt.deleteMany({});
  await prisma.governmentProposal.deleteMany({});
  await prisma.candidateSource.deleteMany({});
  await prisma.candidateDocument.deleteMany({});
  await prisma.candidateSocialNetwork.deleteMany({});
  await prisma.candidateAsset.deleteMany({});
  await prisma.candidate.deleteMany({});
  await prisma.tseCandidateRaw.deleteMany({});

  const officeBySlug = new Map((await prisma.office.findMany()).map((o) => [o.slug, o]));
  const stateByUf = new Map((await prisma.state.findMany()).map((s) => [s.uf, s]));

  const mockCandidates = generateMockCandidates(DEMO_STATES);
  let created = 0;

  for (const c of mockCandidates) {
    const office = officeBySlug.get(c.officeSlug);
    const state = stateByUf.get(c.uf);
    if (!office || !state) continue;
    const party = partyRecords[c.partyIndex];

    const raw = await prisma.tseCandidateRaw.create({
      data: {
        tseCandidateId: c.tseCandidateId,
        electionYear: 2026,
        payloadJson: { ...c, mock: true },
        sourceUrl: "mock://votocerto.ia/dados-de-exemplo",
        checksum: `mock-${c.tseCandidateId}`,
      },
    });

    const candidate = await prisma.candidate.create({
      data: {
        tseCandidateId: c.tseCandidateId,
        roundId: round1.id,
        stateId: state.id,
        officeId: office.id,
        partyId: party.id,
        ballotName: c.ballotName,
        fullName: c.fullName,
        ballotNumber: c.ballotNumber,
        slug: slugify(c.ballotName, c.ballotNumber),
        status: c.status,
        statusDescription:
          c.status === "SUB JUDICE" ? "Candidatura aguardando julgamento — situação sujeita a alteração." : "Candidatura deferida pela Justiça Eleitoral.",
        occupation: c.occupation,
        educationLevel: c.educationLevel,
        birthYear: c.birthYear,
        nationality: "Brasileira",
        isMockData: true,
        rawDataId: raw.id,
        sourceUpdatedAt: new Date(),
      },
    });

    await prisma.candidateSource.create({
      data: {
        candidateId: candidate.id,
        sourceType: "MOCK",
        sourceName: "Dados de exemplo — votocerto.ia",
        sourceUrl: "mock://votocerto.ia/dados-de-exemplo",
        retrievedAt: new Date(),
      },
    });

    if (c.hasAssets) {
      await prisma.candidateAsset.createMany({
        data: [
          { candidateId: candidate.id, assetType: "Apartamento", description: "Imóvel residencial urbano", valueCents: BigInt(45000000) },
          { candidateId: candidate.id, assetType: "Veículo", description: "Automóvel de passeio", valueCents: BigInt(8500000) },
        ],
      });
    }

    await prisma.candidateSocialNetwork.create({
      data: { candidateId: candidate.id, platform: "instagram", url: `https://instagram.com/exemplo_${candidate.slug}` },
    });

    if (c.hasProposal) {
      const proposal = await prisma.governmentProposal.create({
        data: {
          candidateId: candidate.id,
          documentName: "Plano de Governo (documento de exemplo)",
          sourceUrl: "mock://votocerto.ia/plano-de-governo-exemplo.pdf",
        },
      });

      // Posições de exemplo em 4 temas, para demonstrar o comparador.
      const sampleTopics = ["economia", "saude", "seguranca", "meio-ambiente"];
      for (const topicSlug of sampleTopics) {
        const question = createdQuestions.find((q) => q.topicSlug === topicSlug);
        if (!question) continue;
        const position = ((created + topicSlug.length) % 5) - 2; // -2..2 determinístico
        const excerptText = `Trecho de exemplo do plano de governo sobre ${topicSlug.replace("-", " ")}.`;

        await prisma.governmentProposalExcerpt.create({
          data: {
            proposalId: proposal.id,
            topicId: topicByslug.get(topicSlug)!.id,
            originalText: excerptText,
            summary: `Resumo de exemplo: posição ${position} em ${topicSlug}.`,
            sourceDocument: "Plano de Governo (documento de exemplo)",
            sourceUrl: "mock://votocerto.ia/plano-de-governo-exemplo.pdf",
            sourcePage: 1 + (created % 40),
            extractionConfidence: 0.9,
          },
        });

        await prisma.candidateTopicPosition.create({
          data: {
            candidateId: candidate.id,
            questionId: question.id,
            position,
            confidence: 0.9,
            sourceExcerpt: excerptText,
            sourcePage: 1 + (created % 40),
          },
        });
      }
    }

    created++;
  }

  await prisma.dataSyncLog.create({
    data: {
      source: "mock-seed",
      sourceUrl: "mock://votocerto.ia/dados-de-exemplo",
      status: "SUCCESS",
      finishedAt: new Date(),
      recordsReceived: created,
      recordsCreated: created,
    },
  });

  console.log(`OK: ${created} candidatos de EXEMPLO, ${createdQuestions.length} perguntas do quiz.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
