import { NextResponse } from "next/server";

/** Healthcheck raso — não expõe dados sensíveis (briefing §64). */
export async function GET() {
  return NextResponse.json({ status: "ok", service: "votocerto.ia", time: new Date().toISOString() });
}
