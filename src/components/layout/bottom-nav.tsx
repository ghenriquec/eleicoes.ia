"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Newspaper, LineChart, ClipboardList, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/candidatos", label: "Candidatos", icon: Users },
  { href: "/noticias", label: "Notícias", icon: Newspaper },
  { href: "/pesquisas", label: "Pesquisas", icon: LineChart },
  { href: "/minha-cola", label: "Minha cola", icon: ClipboardList },
  { href: "/apuracao", label: "Apuração", icon: Radio },
];

/** Navegação inferior — prioridade mobile (briefing §79). */
export function BottomNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur md:hidden"
      aria-label="Navegação principal"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-6xl items-stretch justify-between px-1">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                  active ? "text-accent-ink" : "text-text-muted",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
