import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/admin/auth";

/**
 * Aplicação real da autenticação (o proxy.ts faz apenas checagem otimista de
 * presença do cookie — a validação criptográfica acontece aqui, servidor a
 * servidor, antes de qualquer dado ser renderizado).
 */
export default async function ProtectedAdminLayout({ children }: LayoutProps<"/admin">) {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);

  if (!session) redirect("/admin/login");

  return (
    <div>
      <header className="border-b border-border bg-surface px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/admin" className="font-display font-semibold">
            votocerto.ia <span className="font-mono text-xs text-taupe-ink">/admin</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-taupe-ink">{session.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        const { cookies: cookiesFn } = await import("next/headers");
        const { ADMIN_COOKIE_NAME: NAME } = await import("@/lib/admin/auth");
        (await cookiesFn()).delete(NAME);
        const { redirect: redirectFn } = await import("next/navigation");
        redirectFn("/admin/login");
      }}
    >
      <button type="submit" className="font-medium text-accent-ink hover:underline">
        Sair
      </button>
    </form>
  );
}
