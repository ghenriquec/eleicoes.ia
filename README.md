# votocerto.ia

Guia apartidário para as Eleições Gerais do Brasil de 2026 — candidatos, quiz
de posicionamento, comparador, cola eleitoral e apuração ao vivo, sempre a
partir de dados oficiais do TSE.

Este repositório é a Fase 1+ da implementação. O planejamento completo (Fase 0
— arquitetura, modelo de dados, riscos, roadmap) está no documento **Blueprint
Eleitoral 2026** publicado durante o planejamento; o detalhe técnico completo
da integração com o TSE — fontes, schemas reais, o que está confirmado e o
que não — está em [`docs/tse-integration.md`](docs/tse-integration.md).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
PostgreSQL · Prisma 7 (driver adapters) · Redis (opcional, fallback em
memória) · Zod · Vitest.

> Simplificação deliberada em relação ao blueprint original: esta é uma
> aplicação Next.js única, não um monorepo Turborepo. As fronteiras de domínio
> continuam separadas por pasta (`lib/domain`, `integrations/tse`, `lib/quiz`),
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

## Integração com o TSE

Vive inteira em `src/integrations/tse/` — candidatos, bens, redes sociais,
plano de governo e apuração, atrás da fachada `TseElectionDataProvider`
(`src/integrations/tse/index.ts`):

```ts
import { getTseElectionDataProvider } from "@/integrations/tse";

const tse = getTseElectionDataProvider();
const candidates = await tse.candidates.find({ state: "MG", office: ElectionOffice.GOVERNOR });
const results = await tse.results.getOfficeResults("MG", ElectionOffice.GOVERNOR, 1);
```

O restante da aplicação só fala com essa fachada e com a API interna
(`/api/elections/2026/...`) — nunca sabe que existe um CSV, um ZIP ou um JSON
do TSE por trás.

**O que já roda de verdade, contra o TSE real:**
- Descoberta de ciclo eleitoral (`npm run tse:sync-results`) — consulta ao
  vivo `resultados.tse.jus.br/oficial/comum/config/ele-c.json` e resolve o
  `cd_eleicao` do pleito dinamicamente. Nunca hardcoded.
- O schema de resultado (`TseResultFileSchema`) foi validado contra três
  respostas reais do TSE (eleição de 2022), incluindo conferência dos
  números com o resultado histórico público (Lula 50,90% no 2º turno) — ver
  `src/integrations/tse/results/results.contract.test.ts`.

**O que está implementado mas não pôde ser validado nesta sessão:** o
download do CSV de candidatos (`cdn.tse.jus.br`) — o TSE bloqueia (HTTP 403)
requisições automatizadas vindas deste ambiente de desenvolvimento, mas não
bloqueia `resultados.tse.jus.br`. Rode `npm run tse:sync-candidates` de uma
rede sem esse bloqueio para validar. Detalhes completos em
[`docs/tse-integration.md`](docs/tse-integration.md).

## O que é real e o que é exemplo

Todo candidato, partido e proposta desta base de desenvolvimento é **dado de
exemplo** (`isMockData: true`), gerado por `src/lib/tse-client/mock-data.ts`
e populado pelo seed. Nada representa uma pessoa real — ver briefing §83. A
interface mostra um selo "DADOS DE EXEMPLO" sempre que esse conteúdo está em
tela.

## Localização automática

Na primeira visita, o site pede a localização do navegador (prompt nativo,
uma vez só) e pré-seleciona o estado do usuário via geocodificação reversa
(BigDataCloud, chamada direta do navegador — nunca passa pelo nosso
servidor). Se recusado, nada muda: o usuário escolhe o estado manualmente
onde for preciso, como sempre. Ver `/privacidade` e
`src/components/layout/location-detector.tsx`.

## Scripts

```bash
npm run dev                  # servidor de desenvolvimento
npm run build                # build de produção
npm run test                 # testes (Vitest) — inclui contract tests contra fixtures reais do TSE
npm run lint                 # ESLint
npm run db:seed              # repopula o banco com dados de exemplo
npm run tse:sync-candidates  # roda o worker de sincronização de candidatos
npm run tse:sync-results     # roda a descoberta de ciclo eleitoral (ao vivo)
npm run tse:capture-fixture  # baixa e salva uma resposta real do TSE como fixture
```

## Admin

`/admin` exige login (`ADMIN_PASSWORD` no `.env`). Autenticação própria
mínima — troque por um provedor real (Auth0/Clerk) antes de produção (ver
blueprint, Decisões Pendentes). O painel mostra o estado real da integração:
última sincronização de candidatos, `cd_eleicao` descoberto para cada turno,
e os recursos do TSE em uso — mais os endpoints de diagnóstico protegidos em
`/api/admin/tse/{status,resources,imports,results-status}`.

## Privacidade

Respostas do quiz e a cola eleitoral do usuário **nunca tocam o servidor** —
vivem só em `localStorage`, no aparelho de quem responde. Ver `/privacidade`.

## Documentos de referência

- [`docs/tse-integration.md`](docs/tse-integration.md) — fontes oficiais,
  schemas reais confirmados, o que ainda depende de validação, e como
  atualizar a integração se o TSE mudar algo.
- Rotas institucionais no próprio site: `/como-funciona`, `/metodologia`,
  `/fontes`.
