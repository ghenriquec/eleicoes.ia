import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-session";
import { TSE_CONFIG } from "@/integrations/tse/config";

export async function GET() {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  return NextResponse.json({
    resources: [
      { name: "Candidatos (CDN)", url: `${TSE_CONFIG.candidatesCdnBaseUrl}/consulta_cand_2026.zip`, confirmed: "pattern-only" },
      { name: "Dataset Candidatos 2026", url: TSE_CONFIG.candidatesDatasetUrl, confirmed: "url-only" },
      { name: "DivulgaCandContas", url: TSE_CONFIG.candidatesComplementaryUrl, confirmed: "url-only" },
      { name: "ele-c.json (índice de eleições)", url: `${TSE_CONFIG.resultsBaseUrl}/comum/config/ele-c.json`, confirmed: "live" },
      { name: "Informações técnicas de resultados", url: TSE_CONFIG.resultsInfoUrl, confirmed: "url-only" },
    ],
  });
}
