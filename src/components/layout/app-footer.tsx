import Link from "next/link";

const LINKS = [
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/metodologia", label: "Metodologia" },
  { href: "/fontes", label: "Fontes" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/correcoes", label: "Encontrou um erro?" },
];

export function AppFooter() {
  return (
    <footer className="mt-16 border-t border-border pb-20 md:pb-8">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-base font-semibold">
              votocerto<span className="text-accent-ink">.ia</span>
            </p>
            <p className="mt-2 max-w-sm text-sm text-text-muted">
              Guia apartidário para as Eleições Gerais de 2026. Nenhum candidato paga para aparecer primeiro ou
              recebe recomendação de voto.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-muted" aria-label="Institucional">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-text">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-8 font-mono text-[11px] text-taupe-ink">
          Dados oficiais de candidaturas: Portal de Dados Abertos do TSE. Dados oficiais de apuração: TSE. Esta
          plataforma não tem qualquer vínculo com o TSE ou o Governo Federal.
        </p>
      </div>
    </footer>
  );
}
