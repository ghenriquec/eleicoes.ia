import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-session";
import { getTseElectionDataProvider } from "@/integrations/tse";

export async function GET() {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  const tse = getTseElectionDataProvider();
  const [round1, round2] = await Promise.all([
    tse.results.getElectionConfiguration(1).catch((e) => ({ error: e instanceof Error ? e.message : String(e) })),
    tse.results.getElectionConfiguration(2).catch((e) => ({ error: e instanceof Error ? e.message : String(e) })),
  ]);

  return NextResponse.json({ round1, round2 });
}
