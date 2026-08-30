import Link from "next/link";
import { ElectionStatusBanner } from "./election-status-banner";

const NAV = [
  { href: "/candidatos", label: "Candidatos" },
  { href: "/quiz", label: "Quiz" },
  { href: "/comparar", label: "Comparar" },
  { href: "/minha-cola", label: "Minha cola" },
  { href: "/apuracao", label: "Apuração" },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur">
      <ElectionStatusBanner />
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[13px] font-bold text-white">
            V
          </span>
          votocerto<span className="text-accent-ink">.ia</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
