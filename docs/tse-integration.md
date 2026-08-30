# Integração com o TSE — status em 30/08/2026

Este documento registra, conforme exigido pelo briefing (§84), tudo o que foi
verificado sobre as fontes oficiais do TSE para 2026 antes de qualquer
implementação — e o que ainda precisa de confirmação humana antes da Fase 4
(Apuração ao vivo).

## Confirmado por pesquisa

| Recurso | URL | Observação |
|---|---|---|
| Dataset Candidatos 2026 | `https://dadosabertos.tse.jus.br/dataset/candidatos-2026` | Portal roda sobre CKAN; recursos observados: Candidatos, Bens de candidatos, Fotos de candidatos, Redes sociais de candidatos, Proposta de governo, Coligações, Vagas, Motivo de cassação. |
| DivulgaCandContas | `https://divulgacandcontas.tse.jus.br/divulga/` | Atualiza candidaturas a cada 1 hora (fonte: notícias de TREs, ago/2026). |
| Informações técnicas — divulgação de resultados 2026 | `https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados` | **Retornou HTTP 403 para todo fetch automatizado nesta sessão de desenvolvimento** — ver seção "Bloqueio de acesso" abaixo. |
| Arquivos da divulgação — Eleições 2026 | `https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/divulgacao-de-resultados` | Confirma a existência dos arquivos EA10, EA11, EA20 e outros. |
| Portal de resultados oficiais | `https://resultados.tse.jus.br/oficial/` | Site de consumo público dos resultados. |
| Resolução TSE nº 23.751/2026 | — | Rege o acesso de terceiros à divulgação de resultados. **Leitura completa pendente.** |

Especificações confirmadas por descrição pública (não por payload real):

- **EA10** — resultado de eleitos. Gerado após a primeira totalização final de
  uma UF; atualizado a cada nova totalização final.
- **EA11** — configuração de eleições.
- **EA20** — resultado unificado. Usado também para Presidente, que **não tem**
  arquivo EA10 próprio.
- Valores de ciclo/eleição/urna são obtidos via um arquivo de configuração
  (`ele-c.json`, mencionado em fontes de terceiros — não verificado
  diretamente nesta sessão).

## Bloqueio de acesso observado nesta sessão

Todo `curl`/`fetch` automatizado partindo deste ambiente de desenvolvimento
para `*.tse.jus.br` e `dadosabertos.tse.jus.br` (incluindo `/api/3/action/package_show`,
a action padrão do CKAN) retornou **HTTP 403**, mesmo com `User-Agent` de
navegador. O registro `npm view`/`curl` para `registry.npmjs.org` funcionou
normalmente no mesmo ambiente, o que indica bloqueio específico de borda
(Akamai) para este IP/rede — não um problema de credenciais ou sintaxe.

**Consequência prática:** os adapters de produção
(`src/lib/tse-client/production-candidate-provider.ts`) foram implementados
seguindo a documentação pública do CKAN e a estrutura observada do portal,
mas **nunca foram executados com sucesso contra o TSE real**. Antes de usar
em produção:

1. Validar a partir de uma rede/IP que o TSE não bloqueia.
2. Confirmar o schema real de resposta do `package_show` e dos CSVs.
3. Ler manualmente (navegador humano) a página de informações técnicas de
   resultados, hoje bloqueada para fetch automatizado, e extrair:
   - padrão exato de URL de download dos arquivos EA10–EA20;
   - frequência de atualização recomendada oficialmente;
   - regras de cache/CDN/conditional requests sugeridas.
4. Ler a Resolução nº 23.751/2026 por completo antes de rodar qualquer worker
   de sincronização em produção.

## O que NÃO foi inventado

- Nenhuma URL de download de arquivo de resultado (EA10–EA20) foi fixada no
  código. `TSE_CONFIG.resultsDownloadBaseUrl` (`src/lib/tse-client/config.ts`)
  fica `null` até ser confirmada, e qualquer tentativa de uso sem essa
  confirmação deve lançar `OfficialResourceNotConfirmedError` — nunca uma
  suposição de padrão de URL.
- Nenhum schema de candidato/resultado foi copiado de eleições anteriores
  (2022/2024). Os nomes de campo usados no parser de CSV
  (`SQ_CANDIDATO`, `NM_URNA_CANDIDATO`, etc.) seguem a convenção historicamente
  estável e documentada do TSE, mas devem ser revalidados contra uma amostra
  real de 2026 antes do primeiro `syncTseCandidates()` em produção.

## Próximos passos (bloqueiam a Fase 4 — Apuração ao vivo)

Ver blueprint, seção "Decisões pendentes", itens 2 e 3.
