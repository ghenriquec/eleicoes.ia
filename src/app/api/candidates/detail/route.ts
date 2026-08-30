import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  if (ids.length === 0 || ids.length > 4) {
    return NextResponse.json({ error: "Informe de 1 a 4 ids em 'ids'." }, { status: 400 });
  }

  const candidates = await prisma.candidate.findMany({
    where: { id: { in: ids } },
    include: {
      state: true,
      office: true,
      party: true,
      assets: true,
      topicPositions: { include: { question: { include: { topic: true } } } },
      sources: true,
    },
  });

  const serialized = candidates.map((c) => ({
    ...c,
    assets: c.assets.map((a) => ({ ...a, valueCents: a.valueCents.toString() })),
  }));

  return NextResponse.json({ candidates: serialized });
}
