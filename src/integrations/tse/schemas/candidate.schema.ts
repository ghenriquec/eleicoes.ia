import { z } from "zod";

/**
 * Schema da linha de CSV `consulta_cand`. ✅ Confirmado contra o arquivo
 * REAL de 2026 (`consulta_cand_2026_BRASIL.csv`, capturado do CDN oficial
 * via Wayback Machine em 30/08/2026 — ver docs/tse-integration.md §4).
 * 50 colunas confirmadas; as usadas pela aplicação estão tipadas abaixo,
 * o resto é preservado via `.passthrough()`.
 *
 * O TSE usa os literais `"#NULO"` e `"#NE"` como marcadores de "sem valor" /
 * "não especificado" — nunca tratar essas strings como dado real (ver
 * `tseNullable` abaixo, usado no mapper).
 */
export const TseCandidateRowSchema = z
  .object({
    SQ_CANDIDATO: z.string().min(1),
    NR_CANDIDATO: z.string().min(1),
    NM_URNA_CANDIDATO: z.string().min(1),
    NM_CANDIDATO: z.string().min(1),
    NM_SOCIAL_CANDIDATO: z.string().optional().default(""),
    SG_UF: z.string().length(2),
    DS_CARGO: z.string().min(1),
    SG_PARTIDO: z.string().min(1),
    NR_PARTIDO: z.string().regex(/^\d+$/),
    NM_PARTIDO: z.string().optional().default(""),
    NM_FEDERACAO: z.string().optional().default(""),
    SG_FEDERACAO: z.string().optional().default(""),
    NM_COLIGACAO: z.string().optional().default(""),
    CD_SITUACAO_CANDIDATURA: z.string().optional().default(""),
    DS_SITUACAO_CANDIDATURA: z.string().optional().default(""),
    DS_OCUPACAO: z.string().optional().default(""),
    DS_GRAU_INSTRUCAO: z.string().optional().default(""),
    DS_ESTADO_CIVIL: z.string().optional().default(""),
    DS_GENERO: z.string().optional().default(""),
    DS_COR_RACA: z.string().optional().default(""),
    DT_NASCIMENTO: z.string().optional().default(""),
    SG_UF_NASCIMENTO: z.string().optional().default(""),
    ANO_ELEICAO: z.string().regex(/^\d{4}$/),
    DS_ELEICAO: z.string().optional().default(""),
    TP_ABRANGENCIA: z.string().optional().default(""),
  })
  .passthrough(); // preserva colunas extras não mapeadas — nunca descarta dado bruto

export type TseCandidateRow = z.infer<typeof TseCandidateRowSchema>;

export const TseAssetRowSchema = z
  .object({
    SQ_CANDIDATO: z.string().min(1),
    DS_TIPO_BEM_CANDIDATO: z.string().min(1),
    DS_BEM_CANDIDATO: z.string().min(1),
    VR_BEM_CANDIDATO: z.string().min(1),
  })
  .passthrough();

export type TseAssetRow = z.infer<typeof TseAssetRowSchema>;

export const TseSocialNetworkRowSchema = z
  .object({
    SQ_CANDIDATO: z.string().min(1),
    DS_URL: z.string().min(1),
  })
  .passthrough();

export type TseSocialNetworkRow = z.infer<typeof TseSocialNetworkRowSchema>;
