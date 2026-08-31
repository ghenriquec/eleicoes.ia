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
npm run db:seed                  # popula perguntas do quiz (+ dados de EXEMPLO, se quiser rodar sem candidatos reais)
npm run dev
```

Copie `.env.example` para `.env` e ajuste `DATABASE_URL` para a conexão que o
`prisma dev` imprimir.

Para popular com **candidatos reais de 2026** em vez de dados de exemplo, ver
"Como popular com dados reais" abaixo.

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
- O schema e o pipeline de candidatos (`syncCandidates()`) foram validados
  com os **19.879 candidatos reais das Eleições Gerais 2026** — ver abaixo.

**Bloqueio de rede deste ambiente:** `cdn.tse.jus.br` (onde o ZIP de
candidatos vive) bloqueia todo acesso automatizado daqui — não bloqueia
`resultados.tse.jus.br`. Rode `npm run tse:sync-candidates` de uma rede sem
esse bloqueio para sincronizar direto do CDN oficial. Detalhes completos em
[`docs/tse-integration.md`](docs/tse-integration.md).

## Como popular com dados reais

O banco deste projeto já está populado com os **19.879 candidatos reais**
das Eleições Gerais 2026 (todos os cargos, todas as 27 UFs), obtidos do CDN
oficial do TSE. Como o CDN está bloqueado neste ambiente de desenvolvimento,
a importação usou uma captura arquivada do próprio arquivo oficial
(Wayback Machine, snapshot de 27/08/2026) como ponte — o pipeline de parsing/
validação/upsert é exatamente o mesmo que roda em produção:

```bash
npx tsx scripts/tse/import-real-candidates.ts /caminho/para/consulta_cand_2026.zip
```

Isso limpa qualquer dado de exemplo residual e importa o ZIP indicado. Em
produção (ou de uma rede sem o bloqueio), use `npm run tse:sync-candidates`
em vez disso — ele baixa direto do CDN.

**Nota honesta sobre o dado:** em 30/08/2026, o TSE ainda não tinha concluído
a análise de nenhuma candidatura — todos os 19.879 registros têm situação
`"AGUARDANDO ANÁLISE DA JUSTIÇA ELEITORAL"` (nunca inventamos "DEFERIDA"). Só
o dataset de Candidatos foi validado; Bens, Redes sociais, Fotos e Proposta
de governo ainda não foram importados (ver `docs/tse-integration.md` §5).

## O que é real e o que é exemplo

Só existe dado de exemplo (`isMockData: true`, gerado por
`src/lib/tse-client/mock-data.ts`) se você rodar `npm run db:seed` sem também
importar os candidatos reais — útil para testar a UI sem depender de rede. A
interface mostra um selo "DADOS DE EXEMPLO" sempre que esse conteúdo está em
tela; nada nele representa uma pessoa real (briefing §83).

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
npm run tse:sync-candidates  # roda o worker de sincronização de candidatos (direto do CDN)
npm run tse:sync-results     # roda a descoberta de ciclo eleitoral (ao vivo)
npm run tse:capture-fixture  # baixa e salva uma resposta real do TSE como fixture
npx tsx scripts/tse/import-real-candidates.ts <zip>  # importa candidatos reais de um ZIP local
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
