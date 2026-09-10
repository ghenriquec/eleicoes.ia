import Link from "next/link";
import { ShieldCheck, Sparkles, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NewsFeed } from "@/components/news/news-feed";
import { STATES } from "@/lib/domain/states";
import { ELECTION_CONFIG, deriveElectionStatus, isLiveResultsPhase } from "@/lib/domain/election-config";
import { getLatestElectionNews } from "@/integrations/news/news-provider";

export const dynamic = "force-dynamic";

export default async function Home() {
  const status = deriveElectionStatus(new Date(), ELECTION_CONFIG);
  const live = isLiveResultsPhase(status);
  const news = await getLatestElectionNews(8);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <section className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent-tint px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-accent-ink">
          Eleições Gerais 2026
        </span>
        <h1 className="mt-5 text-balance font-display text-4xl font-semibold leading-tight sm:text-5xl">
          {live ? "Acompanhe os resultados oficiais." : "Eleições sem complicação."}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-balance text-lg text-text-muted">
          {live
            ? "Resultados oficiais do TSE em tempo real, por estado e por cargo."
            : "Conheça candidatos, consulte dados oficiais, compare propostas e monte sua cola eleitoral."}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {live ? (
            <>
              <Button href="/apuracao" size="lg">
                Acompanhar apuração <ArrowRight size={16} />
              </Button>
              <Button href="/minha-cola" size="lg" variant="secondary">
                Abrir minha cola
              </Button>
            </>
          ) : (
            <>
              <Button href="/minha-cola" size="lg">
                Montar minha cola <ArrowRight size={16} />
              </Button>
              <Button href="/candidatos" size="lg" variant="secondary">
                Conhecer candidatos
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TrustCard icon={ShieldCheck} title="Dados oficiais do TSE" text="Candidaturas e resultados vêm direto da Justiça Eleitoral — nunca inventados." />
        <TrustCard icon={Sparkles} title="Apartidário" text="Nenhum candidato paga para aparecer primeiro ou recebe recomendação de voto." />
        <TrustCard icon={Lock} title="Privacidade por padrão" text="Sua cola eleitoral fica só no seu aparelho — nunca é enviada pra nenhum servidor." />
      </section>

      <section className="mt-16">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold">Escolha seu estado</h2>
          <Link href="/candidatos" className="text-sm font-medium text-accent-ink hover:underline">
            Ver todos os candidatos
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-9">
          {STATES.map((s) => (
            <Link
              key={s.uf}
              href={`/estados/${s.uf.toLowerCase()}`}
              className="rounded-xl border border-border bg-surface px-3 py-3 text-center transition-colors hover:border-accent hover:bg-accent-tint"
            >
              <div className="font-mono text-sm font-semibold">{s.uf}</div>
              <div className="mt-0.5 truncate text-[11px] text-text-muted">{s.name}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StepCard
          step="01"
          title="Veja as pesquisas"
          text="Projeções de institutos como Quaest e Datafolha para presidente e governador, atualizadas conforme saem."
          href="/pesquisas"
          cta="Ver pesquisas"
        />
        <StepCard
          step="02"
          title="Monte sua cola"
          text="Escolha seus candidatos para os 6 cargos e leve uma cola grande e legível para a votação."
          href="/minha-cola"
          cta="Montar cola"
        />
      </section>

      <section className="mt-16">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold">Últimas</h2>
          <p className="font-mono text-xs text-taupe-ink">Presidência e governos estaduais</p>
        </div>
        <Card>
          <NewsFeed items={news} />
        </Card>
        <p className="mt-3 text-xs text-taupe-ink">
          Agregado de feeds públicos (G1, UOL, CNN Brasil, BBC News Brasil) — cada matéria linka pra fonte original.
        </p>
      </section>
    </div>
  );
}

function TrustCard({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
  return (
    <Card>
      <Icon size={20} className="text-accent-ink" />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-text-muted">{text}</p>
    </Card>
  );
}

function StepCard({ step, title, text, href, cta }: { step: string; title: string; text: string; href: string; cta: string }) {
  return (
    <Card className="flex flex-col">
      <span className="font-mono text-xs text-taupe-ink">{step}</span>
      <h3 className="mt-2 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-text-muted">{text}</p>
      <Button href={href} variant="secondary" className="mt-4 self-start">
        {cta}
      </Button>
    </Card>
  );
}
