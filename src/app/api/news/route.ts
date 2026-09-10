import { NextResponse } from "next/server";
import { getLatestElectionNews } from "@/integrations/news/news-provider";

/**
 * GET /api/news — últimas notícias sobre a eleição de 2026, agregadas de
 * feeds RSS públicos (G1, UOL, CNN Brasil, BBC News Brasil). Cada item
 * sempre linka pra matéria original — nunca resumimos ou reescrevemos o
 * conteúdo do veículo.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const candidateSlug = searchParams.get("candidato");
  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 30;

  try {
    const items = await getLatestElectionNews(100);
    const filtered = candidateSlug ? items.filter((i) => i.matchedCandidateSlug === candidateSlug) : items;
    return NextResponse.json({
      data: filtered.slice(0, limit),
      source: "Agregação de RSS públicos (G1, UOL, CNN Brasil, BBC News Brasil)",
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro interno." }, { status: 500 });
  }
}
