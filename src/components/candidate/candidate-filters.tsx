"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { STATES } from "@/lib/domain/states";
import { OFFICES } from "@/lib/domain/offices";

export function CandidateFilters({ parties }: { parties: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe-ink" />
        <input
          type="search"
          placeholder="Digite nome, número ou partido"
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            window.clearTimeout((window as unknown as { __qTimer?: number }).__qTimer);
            (window as unknown as { __qTimer?: number }).__qTimer = window.setTimeout(() => updateParam("q", value), 350);
          }}
          className="w-full rounded-xl border border-border-strong bg-surface py-3 pl-10 pr-4 text-[15px] placeholder:text-taupe-ink focus:border-accent"
          aria-label="Buscar candidatos"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Select
          label="Estado"
          value={searchParams.get("uf") ?? ""}
          onChange={(v) => updateParam("uf", v)}
          options={[{ value: "", label: "Todos os estados" }, ...STATES.map((s) => ({ value: s.uf, label: `${s.name} (${s.uf})` }))]}
        />
        <Select
          label="Cargo"
          value={searchParams.get("cargo") ?? ""}
          onChange={(v) => updateParam("cargo", v)}
          options={[{ value: "", label: "Todos os cargos" }, ...OFFICES.map((o) => ({ value: o.slug, label: o.name }))]}
        />
        <Select
          label="Partido"
          value={searchParams.get("partido") ?? ""}
          onChange={(v) => updateParam("partido", v)}
          options={[{ value: "", label: "Todos os partidos" }, ...parties.map((p) => ({ value: p, label: p }))]}
        />
        <Select
          label="Ordenar"
          value={searchParams.get("sort") ?? "az"}
          onChange={(v) => updateParam("sort", v)}
          options={[
            { value: "az", label: "A–Z" },
            { value: "za", label: "Z–A" },
            { value: "numero", label: "Número" },
            { value: "partido", label: "Partido" },
          ]}
        />
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-border bg-surface py-2 pl-3 pr-2.5 text-sm transition-colors hover:border-accent has-[:focus-visible]:border-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent-tint">
      <span className="text-taupe-ink">{label}</span>
      <span className="relative flex items-center">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-transparent pr-5 font-medium outline-none"
          aria-label={label}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} strokeWidth={2.25} className="pointer-events-none absolute right-0 text-taupe-ink" />
      </span>
    </label>
  );
}
