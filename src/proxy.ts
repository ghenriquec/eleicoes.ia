import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin/auth";

/**
 * Checagem otimista de sessão para /admin (Next 16 renomeou middleware para
 * "proxy" — mesma função). A validação criptográfica real do token acontece
 * no layout do admin (src/app/admin/layout.tsx) — proxy não deve ser a única
 * linha de defesa (ver docs/01-app/01-getting-started/16-proxy.md).
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(ADMIN_COOKIE_NAME);
  if (!hasSession) {
    const url = new URL("/admin/login", request.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/((?!login).*)"],
};
