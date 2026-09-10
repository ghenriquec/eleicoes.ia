import { prisma } from "@/lib/db/client";

/**
 * Pesquisas eleitorais são curadas manualmente (ver scripts/tse/import-poll.ts)
 * a partir de publicações verificáveis de institutos registrados no TSE —
 * nunca calculadas, projetadas ou estimadas por nós. Esta camada só lê o
 * que já foi importado.
 */

export interface PollResultData {
  candidateName: string;
  partyAcronym: string | null;
  percentage: number;
  candidate: {
    slug: string;
    ballotName: string;
    ballotNumber: string;
    photoUrl: string | null;
  } | null;
}

export interface PollData {
  id: string;
  institute: string;
  office: string;
  uf: string;
  round: number;
  questionType: string;
  fieldworkStart: Date | null;
  fieldworkEnd: Date | null;
  publishedAt: Date;
  sampleSize: number | null;
  marginOfError: number | null;
  sourceName: string;
  sourceUrl: string;
  results: PollResultData[];
}

export async function listLatestPolls(office?: "presidente" | "governador", uf?: string): Promise<PollData[]> {
  const polls = await prisma.poll.findMany({
    where: {
      ...(office ? { office } : {}),
      ...(uf ? { uf: uf.toUpperCase() } : {}),
    },
    orderBy: { publishedAt: "desc" },
    include: {
      results: {
        orderBy: { percentage: "desc" },
        include: { candidate: { select: { slug: true, ballotName: true, ballotNumber: true, photoUrl: true } } },
      },
    },
  });

  return polls;
}

export async function listPollUFs(): Promise<string[]> {
  const rows = await prisma.poll.findMany({ where: { office: "governador" }, select: { uf: true }, distinct: ["uf"] });
  return rows.map((r) => r.uf).sort();
}
