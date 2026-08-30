# Integração TSE — Eleições 2026

Documento técnico da integração de dados oficiais do TSE (`TseElectionDataProvider`).
Atualizado em 30/08/2026. Toda URL e todo campo abaixo vem de pesquisa e, onde
indicado, de requisições reais feitas nesta sessão contra os servidores do
TSE — nada foi copiado às cegas de integrações de 2022/2024.

## Como ler este documento

Cada afirmação carrega um selo:

- **✅ Confirmado ao vivo** — obtido de uma resposta HTTP real do TSE nesta sessão, salva em `src/integrations/tse/fixtures/real-2022/`.
- **📄 Confirmado por documentação** — descrito pelo próprio TSE (tse.jus.br) ou por fonte terceira específica, mas não uma resposta que eu mesmo recebi.
- **⚠️ Não confirmado** — inferido por padrão histórico ou nomenclatura razoável. Precisa de validação antes de ir para produção.

## 1. Fontes oficiais encontradas

| Fonte | URL | Finalidade | Formato | Frequência | Status |
|---|---|---|---|---|---|
| Portal de Dados Abertos — dataset Candidatos 2026 | `https://dadosabertos.tse.jus.br/dataset/candidatos-2026` | Candidaturas, bens, redes sociais, fotos, propostas | CSV/ZIP | Atualização periódica durante o registro de candidaturas | 📄 URL confirmada; **bloqueada para fetch automatizado nesta sessão (HTTP 403, Akamai)** |
| CDN de dados abertos | `https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip` | Download direto do CSV de candidatos (padrão observado em 2024: `consulta_cand_2024.zip`) | ZIP contendo CSVs por UF + um `_BRASIL.csv` | Idem acima | 📄 Padrão confirmado via busca; **também bloqueado (HTTP 403) nesta sessão** |
| DivulgaCandContas | `https://divulgacandcontas.tse.jus.br/divulga/` | Consulta individual de candidatura e contas de campanha; complementar ao dataset | Web/JSON interno | Atualiza candidaturas a cada 1h (fonte: notícias de TREs, ago/2026) | 📄 URL confirmada; bloqueada para fetch nesta sessão |
| Config de eleições (resultados) | `https://resultados.tse.jus.br/oficial/comum/config/ele-c.json` | Índice de todos os pleitos/eleições ativos — é assim que o `cd_eleicao` de cada eleição é descoberto, nunca hardcoded | JSON | Regenerado pelo TSE conforme pleitos são criados/atualizados | ✅ **Confirmado ao vivo** — ver seção 3 |
| Resultado simplificado por UF/cargo | `https://resultados.tse.jus.br/oficial/ele{ANO}/{cd_eleicao}/dados-simplificados/{uf}/{uf}-c{cargo:4}-e{cd_eleicao:6}-r.json` | Totalização e candidatos de um cargo em uma UF (ou `br` para nacional) | JSON | — | ✅ **Confirmado ao vivo com dados reais de 2022** — ver seção 3 |
| Portal de resultados oficiais (SPA) | `https://resultados.tse.jus.br/oficial/app/` | Aplicação Angular que consome os JSONs acima | HTML/JS | — | ✅ Confirmado ao vivo (não usado como fonte de dado, só para localizar os JSONs) |
| Informações técnicas — divulgação de resultados 2026 | `https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados` | Documentação oficial dos arquivos EA10–EA20 | HTML/PDF | — | 📄 Confirmada por busca; **bloqueada (HTTP 403) para fetch nesta sessão** |

### Por que `resultados.tse.jus.br` funciona e `dadosabertos`/`www`/`cdn` não

Nesta sessão de desenvolvimento, toda requisição automatizada para
`www.tse.jus.br`, `dadosabertos.tse.jus.br` e `cdn.tse.jus.br` — mesmo com
`User-Agent` de navegador — retornou **HTTP 403** de uma borda Akamai.
`resultados.tse.jus.br` está atrás de infraestrutura diferente e respondeu
normalmente, com headers de cache (`ETag`, `Last-Modified`, `Cache-Control`)
e CORS liberado para leitura. **Consequência prática:** o pipeline de
apuração (resultados) pode ser implementado e testado de verdade agora; o
pipeline de candidaturas (dataset de dados abertos) está com a implementação
pronta, mas não pôde ser validado contra um payload real nesta sessão — ver
seção 4.

## 2. Recursos do dataset Candidatos 2026

| Recurso | Formato | Informação | Confirmação |
|---|---|---|---|
| Candidatos | CSV (`;`, ISO-8859-1) | Dados principais: identificação, cargo, partido, situação | 📄 nomenclatura de colunas confirmada por busca cruzada, não por CSV real |
| Bens de candidatos | CSV | Bens declarados por candidato | 📄 |
| Redes sociais de candidatos | CSV | Links declarados | 📄 |
| Coligações | CSV | Composição de coligações | 📄 |
| Vagas | CSV | Vagas em disputa por cargo/UF | 📄 |
| Motivo de cassação | CSV | Motivo, quando houver | 📄 |
| Fotos de candidatos | Imagem (organizadas por UF, ex. `AC`, `AL`, ... `BR`) | Foto oficial | 📄 |
| Proposta de governo | PDF | Plano de governo registrado | 📄 |

Encoding e delimitador (✅ confirmado por múltiplas fontes independentes,
consistente com o padrão usado desde 2014): **ISO-8859-1 (latin1)**,
delimitador `;`, aspas duplas, quebra de linha `\r\n`. Nunca decodificar como
UTF-8 diretamente — ver `src/integrations/tse/parsers/csv.ts` e os testes de
encoding em `csv.test.ts`.

## 3. Arquivos de resultados — o que foi validado de verdade

### `ele-c.json` — descoberta de eleições

```
GET https://resultados.tse.jus.br/oficial/comum/config/ele-c.json
```

Resposta real (30/08/2026), resumida:

```json
{
  "dg": "17/06/2026", "hg": "17:36:58", "f": "o", "c": "ele2024",
  "arq": [
    { "tp": "a",  "dir": "<base>/<ambiente>/<ciclo>/<cd_eleicao>/config" },
    { "tp": "cm", "dir": "<base>/<ambiente>/<ciclo>/<cd_eleicao>/config" },
    { "tp": "e",  "dir": "<base>/<ambiente>/<ciclo>/<cd_eleicao>/dados/<uf>" },
    { "tp": "cs", "dir": "<base>/<ambiente>/<ciclo>/arquivo-urna/<cd_pleito>/config/<uf>" },
    { "tp": "ab", "dir": "<base>/<ambiente>/<ciclo>/<cd_eleicao>/dados/<uf>" },
    { "tp": "u",  "dir": "<base>/<ambiente>/<ciclo>/<cd_eleicao>/dados/<uf>" }
  ],
  "pl": [
    { "cd": "452", "dt": "06/10/2024", "dtlim": "06/09/2026",
      "e": [{ "cd": "619", "nm": "Eleição Ordinária Municipal - 2024 - 06/10/2024 1º Turno", "t": "1" }] },
    // ... 41 pleitos no total, todos municipais/suplementares até 21/06/2026
  ]
}
```

**⚠️ Achado importante:** em 30/08/2026, este índice **ainda não lista a
Eleição Geral de 2026** (1º turno 04/10/2026). Ele cobre eleições municipais
de 2024 e eleições suplementares municipais até jun/2026. Isso é esperado —
o TSE historicamente publica o pleito de resultados pouco antes da votação —
mas significa que **o worker de apuração não tem, hoje, um `cd_eleicao` real
para consumir**. Ele deve consultar este índice periodicamente (não
diariamente — ver `RESULTS_SYNC_INTERVAL`) e detectar automaticamente quando
um pleito com `dt` próximo de `04/10/2026` aparecer, em vez de esperar um
valor hardcoded. Isso é exatamente a `NEW_ELECTION_PLEITO` que
`resolveElectionCycle()` procura (`src/integrations/tse/results/discover-cycle.ts`).

### Padrão de URL do resultado por UF/cargo (✅ confirmado com dados reais de 2022)

```
GET https://resultados.tse.jus.br/oficial/ele{ANO}/{cd_eleicao}/dados-simplificados/{uf_minusculo}/{uf}-c{cargo:04d}-e{cd_eleicao:06d}-r.json
```

Testado e validado com três chamadas reais, cujas respostas batem
exatamente com o resultado histórico real de 2022 (Lula 48,43% no 1º turno e
50,90% no 2º turno — dado público verificável):

| Chamada | `cd_eleicao` | Escopo | Cargo | Fixture salva |
|---|---|---|---|---|
| Presidente, 1º turno, Brasil | `544` | `br` | `c0001` | `fixtures/real-2022/results-presidente-1t-brasil.json` |
| Presidente, 2º turno, Brasil | `545` | `br` | `c0001` | `fixtures/real-2022/results-presidente-2t-brasil.json` |
| Deputado Federal, Amapá | `546` | `ap` | `c0007` | `fixtures/real-2022/results-deputado-federal-ap.json` |

**⚠️ Os números de `cd_eleicao` (544/545/546) são específicos de 2022 e
nunca devem ser hardcoded** — eles mudam a cada pleito e até variam por UF
para eleições com 2º turno. O código sempre resolve `cd_eleicao` dinamicamente
a partir do `ele-c.json` do ciclo corrente. O que é estável e reaproveitável
é o **formato do JSON de resultado** (campos abaixo) e o **padrão de URL**.

### Schema real do JSON de resultado (nível pleito)

| Campo | Significado | Confirmação |
|---|---|---|
| `ele` | `cd_eleicao` | ✅ |
| `tpabr` / `cdabr` | tipo de abrangência (`br`\|`uf`) / código (ex. `AP`, `br`) | ✅ |
| `carper` | código do cargo (sem zero-padding) | ✅ |
| `md` | modalidade — presente só em majoritário (`E`=1º turno, `S`=?) | ✅ campo existe; significado exato de cada valor ⚠️ |
| `t` | turno (`1`\|`2`) | ✅ |
| `dg`/`hg` | data/hora de geração do arquivo | ✅ |
| `dt`/`ht` | data/hora da totalização | ✅ |
| `s`/`st`/`pst` | seções / seções totalizadas / percentual totalizado | ✅ — **este é o campo de "X% das seções apuradas"** |
| `e`/`ea` | eleitores aptos | ✅ |
| `c`/`pc` | comparecimento / percentual | ✅ |
| `a`/`pa` | abstenção / percentual | ✅ |
| `vb`/`pvb` | votos brancos / percentual | ✅ |
| `vn`/`pvn` | votos nulos / percentual | ✅ |
| `vv`/`pvv` | votos válidos / percentual | ✅ |
| `tv` | total de votos | ✅ |
| `cand[]` | lista de candidatos (ver abaixo) | ✅ |

### Schema real do JSON de resultado (nível candidato, dentro de `cand[]`)

| Campo TSE | Significado | Mapeamento interno |
|---|---|---|
| `sqcand` | sequencial do candidato — **mesma chave que `SQ_CANDIDATO` no dataset de candidatos** | `candidateId` |
| `n` | número de urna | `ballotNumber` |
| `nm` | nome de urna | `ballotName` |
| `nv` | nome do vice (majoritário) ou vazio | `runningMateName` |
| `cc` | partido + coligação (string composta) | `partyAndCoalitionLabel` |
| `st` | situação: `"Eleito"`, `"Não eleito"`, `"Suplente"` (valores observados; 2026 pode ter outros como `"Eleito por QP"`/`"Eleito por Média"`) | `officialStatus` — **usado como está, nunca recalculado** |
| `e` | flag eleito (`"s"`\|`"n"`) | deriva `isElected` |
| `vap` | votos apurados | `votes` |
| `pvap` | percentual de votos apurados | `percentage` |

## 4. Campos do dataset de candidatos — mapeamento

⚠️ **Nomenclatura confirmada por busca cruzada em múltiplas fontes (não por
um CSV real de 2026)** — é a convenção usada de forma estável pelo TSE desde
2014 (2014/2016/2018/2020/2022/2024), mas precisa de uma validação de uma
linha real de 2026 antes de produção. O parser (`src/integrations/tse/parsers/candidates-csv.ts`)
lê por **nome de coluna**, não por posição — se o TSE renomear ou remover um
campo em 2026, o pipeline falha alto e registra o erro (nunca aceita
silenciosamente).

| Campo original TSE | Campo interno | Observação |
|---|---|---|
| `SQ_CANDIDATO` | `tseCandidateId` | identificador estável — nunca nome+número |
| `NR_CANDIDATO` | `ballotNumber` | |
| `NM_URNA_CANDIDATO` | `ballotName` | |
| `NM_CANDIDATO` | `fullName` | |
| `SG_UF` | `uf` | |
| `DS_CARGO` | mapeado via `OFFICE_CODE_MAP` | nunca hardcoded sem passar pelo enum |
| `SG_PARTIDO` | `partyAcronym` | |
| `NR_PARTIDO` | `partyTseNumber` | |
| `NM_COLIGACAO` | `coalitionName` | |
| `DS_SITUACAO_CANDIDATURA` | `status` | valor oficial, nunca inferido |
| `DS_OCUPACAO` | `occupation` | |
| `DS_GRAU_INSTRUCAO` | `educationLevel` | |
| `DT_NASCIMENTO` | `birthDate` | |
| `NM_MUNICIPIO_NASCIMENTO` | `placeOfBirth` | |
| `DS_NACIONALIDADE` | `nationality` | |

## 5. O que fazer antes de ligar `RESULTS_MODE=production`

1. Monitorar `https://resultados.tse.jus.br/oficial/comum/config/ele-c.json`
   até o pleito de 04/10/2026 aparecer (o `syncElectionCycle()` já faz isso
   automaticamente — ver `src/workers/tse-result-sync/`).
2. Validar uma amostra real do CSV de candidatos 2026 assim que o bloqueio de
   rede deste ambiente não se aplicar mais (rodar `scripts/tse/capture-fixtures.ts`
   de uma rede que tenha acesso).
3. Ler por completo a Resolução TSE nº 23.751/2026 antes de habilitar sync
   automatizado em produção.
4. Confirmar o significado exato de `md`, `f`, `dv`, `tf`, `v`, `esae` no
   payload de resultado — foram observados mas não documentados publicamente
   nesta pesquisa; o código trata como opacos/passthrough até então.

## 6. Estratégia de cache e atualização

- **Candidatos:** sync periódico (não em cada request) — ver `TSE_CANDIDATES_SYNC_INTERVAL`.
- **Resultados:** o `ele-c.json` (pequeno, ~20KB) é consultado no intervalo de
  `TSE_RESULTS_DISCOVERY_INTERVAL` para descobrir o `cd_eleicao` vigente;
  uma vez descoberto, os arquivos `*-r.json` por UF/cargo são consultados no
  intervalo de `TSE_RESULTS_SYNC_INTERVAL`. Nenhum valor de produção foi
  fixado sem confirmação — ver `src/integrations/tse/config.ts`.
- HTTP condicional (`If-None-Match`/`If-Modified-Since`) é suportado sempre
  que o TSE devolver `ETag`/`Last-Modified` (confirmado que `ele-c.json` e os
  arquivos de resultado retornam ambos os headers).

## 7. Tratamento de erros

- Toda falha de schema (campo obrigatório ausente, tipo inesperado) é
  validada via Zod e **rejeita o registro com log estruturado** — nunca vira
  `0`, `null` silencioso ou string vazia.
- Falha de rede/timeout aciona o circuit breaker (`CLOSED → OPEN → HALF_OPEN`)
  e a API serve o último snapshot válido com `stale: true`.
- Ver `src/integrations/tse/errors/`.

## 8. Como atualizar esta integração se o TSE mudar algo

1. Rodar `npm run tse:capture-fixture -- <url>` (grava a resposta em
   `fixtures/`) contra o recurso suspeito.
2. Rodar `npm test -- tse` — os contract tests comparam a fixture contra os
   schemas Zod e apontam exatamente qual campo mudou.
3. Atualizar o schema/mapper correspondente, nunca o parser genérico.
4. Documentar a mudança nesta tabela, com data.
