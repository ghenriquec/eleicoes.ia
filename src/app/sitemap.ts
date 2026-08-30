import type { MetadataRoute } from "next";
import { STATES } from "@/lib/domain/states";
import { OFFICES } from "@/lib/domain/offices";
import { prisma } from "@/lib/db/client";

const BASE = "https://votocerto.ia";

// Candidatos mudam com a sincronização do TSE — gerar por request em vez de
// depender de uma conexão de banco disponível em build time.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/candidatos",
    "/quiz",
    "/comparar",
    "/apuracao",
    "/como-funciona",
    "/metodologia",
    "/fontes",
    "/privacidade",
    "/correcoes",
    "/resultados/2026",
  ].map((path) => ({ url: `${BASE}${path}`, lastModified: new Date() }));

  const officeRoutes = OFFICES.map((o) => ({ url: `${BASE}/cargos/${o.slug}`, lastModified: new Date() }));

  const stateRoutes = STATES.flatMap((s) => [
    { url: `${BASE}/estados/${s.uf.toLowerCase()}`, lastModified: new Date() },
    { url: `${BASE}/estados/${s.uf.toLowerCase()}/governador`, lastModified: new Date() },
    { url: `${BASE}/estados/${s.uf.toLowerCase()}/senador`, lastModified: new Date() },
    { url: `${BASE}/estados/${s.uf.toLowerCase()}/deputado-federal`, lastModified: new Date() },
    { url: `${BASE}/estados/${s.uf.toLowerCase()}/deputado-estadual`, lastModified: new Date() },
  ]);

  const candidateRoutes = await prisma.candidate
    .findMany({ select: { slug: true, updatedAt: true }, take: 5000 })
    .then((rows) => rows.map((c) => ({ url: `${BASE}/candidato/${c.slug}`, lastModified: c.updatedAt })))
    .catch(() => []);

  return [...staticRoutes, ...officeRoutes, ...stateRoutes, ...candidateRoutes];
}
