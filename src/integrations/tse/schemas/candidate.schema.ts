import { z } from "zod";

/**
 * Schema da linha de CSV `consulta_cand`. ⚠️ Nomenclatura confirmada por
 * pesquisa cruzada, não por um arquivo real de 2026 (docs/tse-integration.md
 * §4) — falha alto e registra erro se um campo obrigatório não existir, em
 * vez de aceitar silenciosamente.
 */
export const TseCandidateRowSchema = z
  .object({
    SQ_CANDIDATO: z.string().min(1),
    NR_CANDIDATO: z.string().min(1),
    NM_URNA_CANDIDATO: z.string().min(1),
    NM_CANDIDATO: z.string().min(1),
    SG_UF: z.string().length(2),
    DS_CARGO: z.string().min(1),
    SG_PARTIDO: z.string().min(1),
    NR_PARTIDO: z.string().regex(/^\d+$/),
    NM_COLIGACAO: z.string().optional().default(""),
    DS_SITUACAO_CANDIDATURA: z.string().optional().default(""),
    DS_OCUPACAO: z.string().optional().default(""),
    DS_GRAU_INSTRUCAO: z.string().optional().default(""),
    DT_NASCIMENTO: z.string().optional().default(""),
    NM_MUNICIPIO_NASCIMENTO: z.string().optional().default(""),
    DS_NACIONALIDADE: z.string().optional().default(""),
    ANO_ELEICAO: z.string().regex(/^\d{4}$/),
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
