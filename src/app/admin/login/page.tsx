"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("E-mail ou senha inválidos.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8">
        <h1 className="font-display text-xl font-semibold">Acessar /admin</h1>
        <p className="mt-1 text-sm text-text-muted">Acesso restrito à equipe do votocerto.ia.</p>
        <div className="mt-6 flex flex-col gap-3">
          <input name="email" type="email" required placeholder="E-mail" className="rounded-xl border border-border-strong bg-bg px-3.5 py-2.5 text-sm" />
          <input name="password" type="password" required placeholder="Senha" className="rounded-xl border border-border-strong bg-bg px-3.5 py-2.5 text-sm" />
        </div>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={loading} className="mt-5 w-full justify-center">
          {loading ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
