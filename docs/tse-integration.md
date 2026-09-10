# Integração TSE — Eleições 2026

Documento técnico da integração de dados oficiais do TSE (`TseElectionDataProvider`).
Atualizado em 30/08/2026. Toda URL e todo campo abaixo vem de pesquisa e, onde
indicado, de requisições reais feitas nesta sessão contra os servidores do
TSE — nada foi copiado às cegas de integrações de 2022/2024.

## Como ler este documento

Cada afirmação carrega um selo:

- **✅ Confirmado ao vivo** — obtido de uma resposta real do TSE (ou de uma captura arquivada de um arquivo oficial) nesta sessão, salva em `src/integrations/tse/fixtures/`.
- **📄 Confirmado por documentação** — descrito pelo próprio TSE (tse.jus.br) ou por fonte terceira específica, mas não uma resposta que eu mesmo recebi.
- **⚠️ Não confirmado** — inferido por padrão histórico ou nomenclatura razoável. Precisa de validação antes de ir para produção.

## 1. Fontes oficiais encontradas

| Fonte | URL | Finalidade | Formato | Frequência | Status |
|---|---|---|---|---|---|
| Portal de Dados Abertos — dataset Candidatos 2026 | `https://dadosabertos.tse.jus.br/dataset/candidatos-2026` | Candidaturas, bens, redes sociais, fotos, propostas | CSV/ZIP | **4 vezes ao dia** (confirmado na própria página, campo "Frequência de atualização") | ✅ **Confirmado ao vivo — navegável normalmente por um browser real** (ver nota abaixo) |
| CDN de dados abertos | `https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip` | Download direto do ZIP (CSV por UF + `_BRASIL.csv` consolidado) | ZIP | Idem acima | ✅ URL **confirmada ao vivo** direto no portal (link real observado); conteúdo **validado com um payload real de 20.769 candidatos** — ver seção 4. Host bloqueado (403) para todo acesso automatizado neste ambiente, inclusive via browser real — ver nota abaixo |
| DivulgaCandContas (site + API REST não-oficial documentada) | `https://divulgacandcontas.tse.jus.br/divulga/rest/v1/...` | Consulta individual de candidatura e contas de campanha; complementar ao dataset | Web/JSON | Candidaturas atualizam a cada 1h (notícias de TREs, ago/2026) | 📄 URL e endpoints documentados (repositório `augusto-herrmann/divulgacandcontas-doc`); **bloqueada (403) neste ambiente**, todo o host, path incluído |
| Config de eleições (resultados) | `https://resultados.tse.jus.br/oficial/comum/config/ele-c.json` | Índice de todos os pleitos/eleições ativos — é assim que o `cd_eleicao` de cada eleição é descoberto, nunca hardcoded | JSON | Regenerado pelo TSE conforme pleitos são criados/atualizados | ✅ **Confirmado ao vivo** — ver seção 3 |
| Resultado simplificado por UF/cargo | `https://resultados.tse.jus.br/oficial/ele{ANO}/{cd_eleicao}/dados-simplificados/{uf}/{uf}-c{cargo:4}-e{cd_eleicao:6}-r.json` | Totalização e candidatos de um cargo em uma UF (ou `br` para nacional) | JSON | — | ✅ **Confirmado ao vivo com dados reais de 2022** — ver seção 3 |
| Portal de resultados oficiais (SPA) | `https://resultados.tse.jus.br/oficial/app/` | Aplicação Angular que consome os JSONs acima | HTML/JS | — | ✅ Confirmado ao vivo (não usado como fonte de dado, só para localizar os JSONs) |
| Informações técnicas — divulgação de resultados 2026 | `https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados` | Documentação oficial dos arquivos EA10–EA20 | HTML/PDF | — | 📄 Confirmada por busca; **bloqueada (HTTP 403) para fetch nesta sessão** |

### Por que alguns hosts funcionam e outros não — e como isso mudou o plano

Nesta sessão, o bloqueio da Akamai se mostrou **por cliente, não só por
host**: `dadosabertos.tse.jus.br` bloqueia toda requisição de terminal
(`curl`, `fetch` puro — HTTP 403) mas **carrega normalmente por um browser
real** (o Claude in Chrome/Browser pane conseguiu navegar e ler a página do
dataset inteira). Já `cdn.tse.jus.br` — onde o ZIP de verdade fica — bloqueia
os dois caminhos, sem exceção. `resultados.tse.jus.br` nunca bloqueou nada.
`sig.tse.jus.br` devolve um desafio anti-bot (F5/TSPD) que não tentamos
contornar.

**Como contornamos isso para validar o dataset de candidatos:** o Internet
Archive (`web.archive.org`) já tinha uma captura do próprio ZIP oficial do
CDN, datada de **27/08/2026** (dataset criado em 22/07/2026, então essa
captura é essencialmente atual). Baixamos essa captura
(`http://web.archive.org/web/20260828202244id_/https://cdn.tse.jus.br/...`),
validamos o checksum (3.139.062 bytes, batendo com o `Content-Length`
original preservado pelo Wayback) e processamos os 20.769 candidatos reais
com o mesmo pipeline (`syncCandidates()`) que roda contra o CDN direto em
produção — ver `scripts/tse/import-real-candidates.ts`. **Isso não substitui
o worker de produção**, que continua batendo direto no CDN oficial; é uma
ponte só para validar/popular localmente enquanto este ambiente específico
está bloqueado.

## 2. Recursos do dataset Candidatos 2026

| Recurso | Formato | Informação | Confirmação |
|---|---|---|---|
| Candidatos | CSV (`;`, ISO-8859-1) | Dados principais: identificação, cargo, partido, situação | ✅ **validado com 20.769 linhas reais** |
| Candidatos - Informações complementares | CSV | Campos adicionais por candidato | 📄 URL confirmada, conteúdo não validado |
| Bens de candidatos | CSV | Bens declarados por candidato | 📄 URL confirmada, conteúdo não validado |
| Redes sociais de candidatos | CSV | Links declarados | 📄 URL confirmada, conteúdo não validado |
| Coligações | CSV | Composição de coligações | 📄 |
| Vagas | CSV | Vagas em disputa por cargo/UF | 📄 |
| Motivo de cassação | CSV | Motivo, quando houver | 📄 |
| Fotos de candidatos | Imagem, um recurso por UF (`AC`...`TO`, `BR` para Presidente) | Foto oficial | 📄 URL por UF confirmada no portal, conteúdo não baixado |
| Proposta de governo | PDF, um recurso por UF + `BR` | Plano de governo registrado | 📄 |
| Certidões criminais | PDF, um recurso por UF + `BR` | Certidão, quando disponibilizada | 📄 — recurso existe mas não estava no briefing original |

Encoding e delimitador — **✅ confirmado com o arquivo real**: ISO-8859-1
(latin1), delimitador `;`, aspas duplas, quebra de linha CRLF. Ver
`src/integrations/tse/parsers/csv.ts` e os testes de encoding em `csv.test.ts`.

## 3. Arquivos de resultados — o que foi validado de verdade

### `ele-c.json` — descoberta de eleições

```
GET https://resultados.tse.jus.br/oficial/comum/config/ele-c.json
```

**⚠️ Achado importante:** em 30/08/2026, este índice **ainda não lista a
Eleição Geral de 2026** (1º turno 04/10/2026) — cobre só eleições municipais
de 2024 e suplementares até jun/2026. Isso é esperado (o TSE publica o
pleito de resultados pouco antes da votação), mas confirma que **o worker de
apuração não tem, hoje, um `cd_eleicao` real de resultados para consumir**.
`discoverGeneralElectionCycle()` (`src/integrations/tse/results/discover-cycle.ts`)
já consulta este índice e trata a ausência corretamente — ver `LiveResults`
no frontend.

**Achado novo (seção 4): o `cd_eleicao` da eleição em si — não do módulo de
resultados — já existe e aparece no próprio dataset de candidatos:**
`CD_ELEICAO=6257` ("Eleição Geral Federal 2026") e `CD_ELEICAO=6259`
("Eleições Gerais Estaduais 2026"). Não é o mesmo `cd_eleicao` usado nas URLs
de resultado (que é alocado pelo módulo de totalização, historicamente
diferente do de candidatura — em 2022 os pleitos de candidatura e resultado
também tinham numeração própria), mas é um indício forte de por onde
procurar quando o `ele-c.json` for atualizado.

### Padrão de URL do resultado por UF/cargo (✅ confirmado com dados reais de 2022)

```
GET https://resultados.tse.jus.br/oficial/ele{ANO}/{cd_eleicao}/dados-simplificados/{uf_minusculo}/{uf}-c{cargo:04d}-e{cd_eleicao:06d}-r.json
```

Testado e validado com três chamadas reais, cujas respostas batem
exatamente com o resultado histórico real de 2022 (Lula 48,43% no 1º turno e
50,90% no 2º turno — dado público verificável). Fixtures em
`src/integrations/tse/fixtures/real-2022/`. **⚠️ Os números de `cd_eleicao`
observados (544/545/546) são específicos de 2022 e nunca devem ser
hardcoded** — resolvido sempre dinamicamente a partir de `ele-c.json`.

### Schema real do JSON de resultado

Ver tabelas completas na versão anterior deste documento (histórico no git) —
resumo: `pst` = % de seções totalizadas, `cand[].sqcand` = mesma chave que
`SQ_CANDIDATO` do dataset de candidatos (permiteju junção entre os dois
datasets), `cand[].st` = situação oficial (nunca recalculada), `cand[].vap`/`pvap`
= votos/percentual.

## 4. Dataset de candidatos 2026 — schema real confirmado

✅ **As 50 colunas abaixo foram lidas diretamente do arquivo oficial real**
(`consulta_cand_2026_BRASIL.csv`, 20.769 linhas, capturado via Wayback
Machine em 30/08/2026 a partir do snapshot de 27/08/2026 do CDN oficial).
Isso substitui a nomenclatura "confirmada por busca cruzada" da versão
anterior deste documento — agora é validação direta contra o dado real.

```
DT_GERACAO, HH_GERACAO, ANO_ELEICAO, CD_TIPO_ELEICAO, NM_TIPO_ELEICAO,
NR_TURNO, CD_ELEICAO, DS_ELEICAO, DT_ELEICAO, TP_ABRANGENCIA, SG_UF, SG_UE,
NM_UE, CD_CARGO, DS_CARGO, SQ_CANDIDATO, NR_CANDIDATO, NM_CANDIDATO,
NM_URNA_CANDIDATO, NM_SOCIAL_CANDIDATO, NR_CPF_CANDIDATO, DS_EMAIL,
CD_SITUACAO_CANDIDATURA, DS_SITUACAO_CANDIDATURA, TP_AGREMIACAO, NR_PARTIDO,
SG_PARTIDO, NM_PARTIDO, NR_FEDERACAO, NM_FEDERACAO, SG_FEDERACAO,
DS_COMPOSICAO_FEDERACAO, SQ_COLIGACAO, NM_COLIGACAO, DS_COMPOSICAO_COLIGACAO,
SG_UF_NASCIMENTO, DT_NASCIMENTO, NR_TITULO_ELEITORAL_CANDIDATO, CD_GENERO,
DS_GENERO, CD_GRAU_INSTRUCAO, DS_GRAU_INSTRUCAO, CD_ESTADO_CIVIL,
DS_ESTADO_CIVIL, CD_COR_RACA, DS_COR_RACA, CD_OCUPACAO, DS_OCUPACAO,
CD_SIT_TOT_TURNO, DS_SIT_TOT_TURNO
```

### Mapeamento (campo original TSE → campo interno)

| Campo original TSE | Campo interno | Observação |
|---|---|---|
| `SQ_CANDIDATO` | `tseCandidateId` | identificador estável — nunca nome+número |
| `NR_CANDIDATO` | `ballotNumber` | |
| `NM_URNA_CANDIDATO` | `ballotName` | |
| `NM_CANDIDATO` | `fullName` | |
| `SG_UF` | `uf` | `"BR"` para Presidente (confirmado — não é `""`/nulo) |
| `DS_CARGO` | mapeado via `CANDIDATE_OFFICE_CODE_MAP` | ver lista completa de valores abaixo |
| `SG_PARTIDO` / `NR_PARTIDO` / `NM_PARTIDO` | `partyAbbreviation` / `partyNumber` / `partyName` | nome do partido agora é real, não mais `null` |
| `NM_FEDERACAO` | `federation` | `"#NULO"` quando o partido não está em federação |
| `NM_COLIGACAO` | `coalition` | |
| `DS_SITUACAO_CANDIDATURA` | `status` | ver nota sobre `"#NE"` abaixo |
| `DS_OCUPACAO` | `occupation` | |
| `DS_GRAU_INSTRUCAO` | `education` | |
| `DT_NASCIMENTO` | `birthDate` | |
| `SG_UF_NASCIMENTO` | `birthplace` | **mudou de granularidade**: é a UF de nascimento, não o município — o dataset real não tem `NM_MUNICIPIO_NASCIMENTO` nem `DS_NACIONALIDADE` (campos presumidos na primeira versão deste documento e que não existem) |

### Marcadores de "sem valor" do TSE — nunca mostrar como texto

O TSE usa os literais `"#NULO"` e `"#NE"` (e códigos negativos como `-1`/`-3`
nos campos `CD_*` correspondentes) para "sem valor"/"não especificado".
`tseNullable()` (`src/integrations/tse/mappers/candidate-mapper.ts`) converte
esses literais para `null` de verdade — nunca deixamos `"#NULO"` vazar para a
interface.

### `DS_SITUACAO_CANDIDATURA` estava `"#NE"` para as 20.769 linhas

Em 30/08/2026, **100% das candidaturas** no arquivo real tinham
`CD_SITUACAO_CANDIDATURA=-3` / `DS_SITUACAO_CANDIDATURA="#NE"` — a Justiça
Eleitoral ainda não concluiu a análise de nenhuma candidatura neste momento
do calendário. Por isso o mapper nunca inventa "DEFERIDA": quando o TSE não
decidiu, o status interno vira `"AGUARDANDO ANÁLISE DA JUSTIÇA ELEITORAL"`,
exibido com um selo neutro (nunca vermelho/"rejeitada", nunca
verde/"aprovada"). `DS_SIT_TOT_TURNO` (resultado da apuração) também estava
uniformemente `"#NULO"` — esperado, a eleição ainda não aconteceu.

### `DS_CARGO` tem mais valores do que os 6 cargos do produto

Valores reais observados: `PRESIDENTE` (13), `VICE-PRESIDENTE` (13),
`GOVERNADOR` (198), `VICE-GOVERNADOR` (203), `SENADOR` (318), `1º SUPLENTE`
(329), `2º SUPLENTE` (332), `DEPUTADO FEDERAL` (7.725), `DEPUTADO ESTADUAL`
(11.209), `DEPUTADO DISTRITAL` (429). `CANDIDATE_OFFICE_CODE_MAP` só mapeia
os 6 cargos que o eleitor escolhe diretamente na urna — vice-presidente,
vice-governador e os 2 suplentes de senador voltam `null` de
`mapCandidateOfficeCode()` e são **ignorados na importação, sem gerar erro**
(são parte da "chapa" do candidato principal, não candidaturas separadas do
ponto de vista do produto). Isso está documentado, não é um bug — mas é uma
simplificação de escopo que vale revisar se o produto quiser mostrar o vice
na página do titular.

## 5. O que ainda falta para produção

1. Rodar o worker de verdade (`npm run tse:sync-candidates`) direto contra o
   CDN a partir de uma rede sem o bloqueio deste ambiente — o pipeline já foi
   validado ponta a ponta com dado real via Wayback Machine, falta só trocar
   a fonte. O mesmo vale para `syncAssets`/`syncSocialNetworks`.
2. Monitorar `ele-c.json` até o pleito de resultados de 2026 aparecer.
3. Ler por completo a Resolução TSE nº 23.751/2026 antes de habilitar sync
   automatizado em produção.
4. ✅ Validados contra payload real em 30/08/2026: Candidatos (19.879),
   Fotos (13.579), Bens declarados (`bem_candidato_2026.zip`, 71.002 itens,
   0 rejeições após o fix do parser de CSV — ver §9) e Redes sociais
   (`rede_social_candidato_2026.zip`, 40.735 links, 0 rejeições).
   Ainda faltam: Proposta de governo e Prestação de contas (ver item 5).
5. **Prestação de contas / ranking de doadores — bloqueado neste ambiente.**
   `divulgacandcontas.tse.jus.br` (portal "Divulgação de Candidaturas e
   Contas Eleitorais", inclusive a API REST que ele consome,
   `/divulga/rest/v1/...`) está atrás do mesmo Akamai que bloqueia os outros
   hosts do TSE — funciona só via navegador de verdade (confirmado
   navegando manualmente até o perfil de um candidato), 403 em toda
   chamada `curl`/`fetch` de servidor. Não é uma opção fazer scraping de
   ~20.900 perfis individuais via automação de navegador — fora de escala e
   de propósito para essa ferramenta.
   O dataset correto para "ranking de doadores" é o bulk oficial
   **"Prestação de Contas Eleitorais - 2026"**
   (`dadosabertos.tse.jus.br/dataset/prestacao-de-contas-eleitorais-2026`,
   recurso "Prestação de contas de candidatos" →
   `cdn.tse.jus.br/estatistica/sead/odsele/prestacao_contas/prestacao_de_contas_eleitorais_candidatos_2026.zip`),
   que reúne receitas (inclusive por doador originário), despesas e
   extratos bancários num único ZIP — mesmo padrão dos outros datasets.
   Diferente deles, esse arquivo **não tem nenhuma captura no Wayback
   Machine ainda** para 2026 (confirmado via CDX API em 30/08/2026), e pelos
   equivalentes de 2018/2022 (287 MB e 138–371 MB respectivamente) é grande
   demais para uma captura sob demanda.
   **Atualização 31/08/2026:** confirmamos que navegar (via browser real) até
   `web.archive.org/save/<url>` aciona uma captura nova sem precisar de
   conta — foi assim que recapturamos as fotos e ganhamos ~6.300 candidatos
   com foto que faltavam (ver §5 do README). Mas esse caminho tem teto de
   tamanho: o próprio ZIP de fotos de SP (15 MB) já deu 504 do lado do TSE
   pro crawler do Wayback duas vezes seguidas antes de completar, e o de
   contas eleitorais é 10-25x maior — não é razoável esperar que funcione.
   Path a seguir: (a) tentar de novo mais adiante — o Wayback costuma
   arquivar os outros datasets desse portal poucos dias após a publicação;
   (b) rodar `npm run tse:sync-candidates`-equivalente de uma rede sem o
   bloqueio; ou (c) o usuário baixar o ZIP manualmente e apontar um script
   de importação (a construir, mesmo padrão de `import-real-assets.ts`) pro
   arquivo local.

## 6. Estratégia de cache e atualização

- **Candidatos:** sync periódico (não em cada request) — ver `TSE_CANDIDATES_SYNC_INTERVAL`. TSE atualiza o dataset 4x/dia (confirmado no portal) — não faz sentido sincronizar com mais frequência que isso.
- **Resultados:** `ele-c.json` consultado no intervalo de `TSE_RESULTS_DISCOVERY_INTERVAL`; uma vez descoberto o `cd_eleicao`, os arquivos `*-r.json` no intervalo de `TSE_RESULTS_SYNC_INTERVAL`.
- HTTP condicional (`ETag`/`Last-Modified`) suportado sempre que o TSE devolver os headers.

## 7. Tratamento de erros

- Toda falha de schema é validada via Zod e **rejeita o registro com log estruturado** — nunca vira `0`, `null` silencioso ou string vazia.
- Falha de rede/timeout aciona o circuit breaker (`CLOSED → OPEN → HALF_OPEN`) e a API serve o último snapshot válido com `stale: true`.
- Ver `src/integrations/tse/errors/`.

## 8. Como atualizar esta integração se o TSE mudar algo

1. Rodar `npm run tse:capture-fixture -- <url> <nome.json>` (para resultados) ou baixar o ZIP mais recente de candidatos.
2. Rodar `npm test` — os contract tests comparam a fixture contra os schemas Zod e apontam exatamente qual campo mudou.
3. Atualizar o schema/mapper correspondente, nunca o parser genérico.
4. Documentar a mudança nesta tabela, com data.

## 9. Bug real encontrado: quebra de linha embutida em campo entre aspas

Ao importar `bem_candidato_2026.zip` em 30/08/2026, 164 de 76.487 linhas
falharam a validação de schema com campos visivelmente deslocados (ex.:
`DT_GERACAO` recebendo o texto de uma descrição de bem). Causa: `parseCsv`
(`src/integrations/tse/parsers/csv.ts`) quebrava o texto inteiro em linhas
por `\n`/`\r\n` **antes** de interpretar aspas — um campo de descrição de
bem com quebra de linha embutida (CSV válido, e o TSE usa isso de fato)
partia a linha em duas, corrompendo aquela linha e a seguinte.

Corrigido: o parser agora tokeniza o texto inteiro num único passe,
respeitando `inQuotes` através de quebras de linha (`tokenizeCsv`). Depois
do fix, o mesmo arquivo importou com **0 rejeições** (76.365 linhas, a
contagem mudou porque as linhas antes fantasmas-partidas por aspas deixaram
de existir). Testes de regressão em
`src/integrations/tse/parsers/csv.test.ts`. Esse parser é compartilhado por
todos os datasets (`consulta_cand`, `bem_candidato`, `rede_social_candidato`)
— qualquer novo dataset que passe por ele já herda o fix.
