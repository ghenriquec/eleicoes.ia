import { NextResponse } from "next/server";
import { getCandidatesForBallotSlot } from "@/lib/data/candidates";

/**
 * Candidatos elegíveis para um slot da cola (UF + cargo). Endpoint interno —
 * o navegador nunca consulta o TSE diretamente (blueprint §07).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uf = searchParams.get("uf");
  const office = searchParams.get("office");

  if (!uf || !office) {
    return NextResponse.json({ error: "Parâmetros 'uf' e 'office' são obrigatórios." }, { status: 400 });
  }

  const candidates = await getCandidatesForBallotSlot(uf, office);
  return NextResponse.json({ candidates });
}
