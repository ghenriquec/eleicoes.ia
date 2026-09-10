import type { Metadata } from "next";
import { NoticiasClient } from "./noticias-client";
import { getLatestElectionNews } from "@/integrations/news/news-provider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notícias",
  description: "Últimas notícias sobre a Presidência e os governos estaduais, agregadas de veículos de imprensa.",
};

export default async function NoticiasPage() {
  const news = await getLatestElectionNews(80);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Notícias</h1>
      <p className="mt-2 text-text-muted">
        Agregado de feeds públicos (G1, UOL, CNN Brasil, BBC News Brasil) — cada matéria linka pra fonte original, nunca resumida ou reescrita.
      </p>
      <NoticiasClient initialNews={news} />
    </div>
  );
}
