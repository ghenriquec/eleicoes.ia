# votocerto.ia

Guia apartidário para as Eleições Gerais do Brasil de 2026 — candidatos, quiz
de posicionamento, comparador, cola eleitoral e apuração ao vivo, sempre a
partir de dados oficiais do TSE.

Este repositório é a Fase 1+ da implementação. O planejamento completo (Fase 0
— arquitetura, modelo de dados, riscos, roadmap) está no documento **Blueprint
Eleitoral 2026** publicado durante o planejamento; o resumo prático de como o
TSE foi/não foi verificado está em [`docs/tse-integration.md`](docs/tse-integration.md).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
PostgreSQL · Prisma 7 (driver adapters) · Zod · Vitest.

> Simplificação deliberada em relação ao blueprint original: esta é uma
> aplicação Next.js única, não um monorepo Turborepo. As fronteiras de domínio
> continuam separadas por pasta (`lib/domain`, `lib/tse-client`, `lib/quiz`),
> prontas para virar pacotes próprios se o time crescer.

## Rodando localmente

```bash
npm install
npx prisma dev -n votocerto -d   # sobe um Postgres local efêmero (sem Docker)
npx prisma db push
npm run db:seed                  # popula dados de EXEMPLO — nunca reais
npm run dev
```

Copie `.env.example` para `.env` e ajuste `DATABASE_URL` para a conexão que o
`prisma dev` imprimir.

## O que é real e o que é exemplo

Todo candidato, partido e proposta desta base de desenvolvimento é **dado de
exemplo** (`isMockData: true`), gerado por `src/lib/tse-client/mock-data.ts`.
Nada representa uma pessoa real — ver briefing §83. A interface mostra um selo
"DADOS DE EXEMPLO" sempre que esse conteúdo está em tela.

O adapter de produção (`src/lib/tse-client/production-candidate-provider.ts`)
foi escrito contra a documentação pública do Portal de Dados Abertos do TSE,
mas **nunca rodou com sucesso** neste ambiente de desenvolvimento — o TSE
bloqueia (HTTP 403) requisições automatizadas vindas daqui. Ver
`docs/tse-integration.md` para o que precisa ser validado antes de ligar isso
em produção.

## Scripts

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção
npm run test     # testes de domínio (Vitest)
npm run lint     # ESLint
npm run db:seed  # repopula o banco com dados de exemplo
```

## Admin

`/admin` exige login (`ADMIN_PASSWORD` no `.env`). Autenticação própria
mínima — troque por um provedor real (Auth0/Clerk) antes de produção (ver
blueprint, Decisões Pendentes).

## Privacidade

Respostas do quiz e a cola eleitoral do usuário **nunca tocam o servidor** —
vivem só em `localStorage`, no aparelho de quem responde. Ver `/privacidade`.

## Documentos de referência

- [`docs/tse-integration.md`](docs/tse-integration.md) — o que foi confirmado
  e o que ainda depende de leitura humana da documentação do TSE.
- Rotas institucionais no próprio site: `/como-funciona`, `/metodologia`,
  `/fontes`.
