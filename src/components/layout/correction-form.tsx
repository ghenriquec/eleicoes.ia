"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

export function CorrectionForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const payload = {
      candidateId: (form.get("candidateId") as string) || null,
      field: form.get("field") as string,
      description: form.get("description") as string,
      suggestedSource: (form.get("suggestedSource") as string) || null,
      reporterEmail: (form.get("reporterEmail") as string) || null,
    };
    const res = await fetch("/api/correcoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setStatus(res.ok ? "sent" : "error");
    if (res.ok) e.currentTarget.reset();
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-accent bg-accent-tint p-4 text-sm text-accent-ink">
        Obrigado — sua correção foi registrada e vai passar por revisão antes de qualquer alteração.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Candidato (nome ou link do perfil)" name="candidateId" />
      <Field label="Campo com problema" name="field" required placeholder="Ex.: patrimônio, redes sociais, situação" />
      <Field label="Descreva o problema" name="description" required textarea />
      <Field label="Fonte sugerida (opcional)" name="suggestedSource" placeholder="Link com a informação correta" />
      <Field label="Seu e-mail (opcional)" name="reporterEmail" type="email" placeholder="Caso queira retorno" />
      <Button type="submit" disabled={status === "sending"} className="self-start">
        {status === "sending" ? "Enviando…" : "Enviar correção"}
      </Button>
      {status === "error" && <p className="text-sm text-danger">Algo deu errado. Tente novamente.</p>}
    </form>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
  type = "text",
  textarea,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">
        {label}
        {required && " *"}
      </span>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          placeholder={placeholder}
          rows={4}
          className="rounded-xl border border-border-strong bg-surface px-3.5 py-2.5"
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          className="rounded-xl border border-border-strong bg-surface px-3.5 py-2.5"
        />
      )}
    </label>
  );
}
