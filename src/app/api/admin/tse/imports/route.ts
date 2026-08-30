import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  const imports = await prisma.tseImportFile.findMany({
    orderBy: { downloadedAt: "desc" },
    take: 50,
    select: {
      id: true,
      dataset: true,
      resourceName: true,
      resourceUrl: true,
      fileName: true,
      checksum: true,
      status: true,
      downloadedAt: true,
      electionYear: true,
      _count: { select: { rawRecords: true } },
    },
  });

  return NextResponse.json({ imports });
}
