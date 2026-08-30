import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";

const schema = z.object({
  candidateId: z.string().max(100).optional().nullable(),
  field: z.string().min(1).max(200),
  description: z.string().min(10).max(4000),
  suggestedSource: z.string().max(2000).optional().nullable(),
  reporterEmail: z.string().email().max(320).optional().nullable().or(z.literal("")),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { candidateId, field, description, suggestedSource, reporterEmail } = parsed.data;

  await prisma.correctionReport.create({
    data: {
      candidateId: candidateId || null,
      field,
      description,
      suggestedSource: suggestedSource || null,
      reporterEmail: reporterEmail || null,
      status: "OPEN",
    },
  });

  return NextResponse.json({ ok: true });
}
