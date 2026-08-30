import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "./auth";

/** Usar no topo de toda rota /api/admin/** — o proxy.ts só protege páginas, não rotas de API. */
export async function requireAdminSession(): Promise<{ email: string } | NextResponse> {
  const jar = await cookies();
  const session = verifySessionToken(jar.get(ADMIN_COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  return session;
}
