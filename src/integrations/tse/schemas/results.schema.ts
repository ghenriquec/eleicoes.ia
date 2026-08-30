import { z } from "zod";

/**
 * Schema do JSON de resultado por UF/cargo — validado contra respostas
 * REAIS do TSE obtidas nesta sessão (docs/tse-integration.md §3), não
 * inventado. Campos cujo significado exato não foi documentado publicamente
 * (`md`, `f`, `dv`, `tf`, `v`, `esae`, `mnae`) são aceitos como string opaca
 * — nunca descartados, nunca interpretados sem confirmação.
 */

const numericString = z.string().regex(/^-?\d+$/, "esperado string numérica");
const percentString = z.string().regex(/^\d+,\d{2}$/, "esperado percentual '00,00'");

export const TseResultCandidateSchema = z.object({
  seq: z.string(),
  sqcand: z.string(),
  n: z.string(),
  nm: z.string(),
  cc: z.string(),
  nv: z.string().optional().default(""),
  e: z.enum(["s", "n"]),
  st: z.string(),
  dvt: z.string(),
  vap: numericString,
  pvap: percentString,
});

export const TseResultFileSchema = z.object({
  ele: z.string(),
  tpabr: z.string(),
  cdabr: z.string(),
  carper: z.string(),
  md: z.string().optional(),
  t: z.string(), // turno
  f: z.string().optional(),
  dg: z.string(),
  hg: z.string(),
  dt: z.string(),
  ht: z.string(),
  s: numericString, // seções
  st: numericString, // seções totalizadas
  pst: percentString,
  sa: numericString.optional(), // seções apuradas
  e: numericString, // eleitores aptos
  c: numericString.optional(), // comparecimento
  pc: percentString.optional(),
  a: numericString.optional(), // abstenção
  pa: percentString.optional(),
  vb: numericString.optional(), // brancos
  pvb: percentString.optional(),
  vn: numericString.optional(), // nulos
  pvn: percentString.optional(),
  vv: numericString.optional(), // válidos
  pvv: percentString.optional(),
  tv: numericString.optional(), // total de votos
  cand: z.array(TseResultCandidateSchema),
});

export type TseResultFile = z.infer<typeof TseResultFileSchema>;
export type TseResultCandidate = z.infer<typeof TseResultCandidateSchema>;

/** Schema do índice de eleições (ele-c.json) — confirmado ao vivo. */
export const TseElectionEntrySchema = z.object({
  cd: z.string(),
  cdt2: z.string().optional(),
  sqele: z.string().optional(),
  nm: z.string(),
  t: z.string(),
  tp: z.string().optional(),
});

export const TsePleitoSchema = z.object({
  cd: z.string(),
  cdpr: z.string().optional(),
  dt: z.string(),
  dtlim: z.string().optional(),
  e: z.array(TseElectionEntrySchema),
});

export const TseElectionConfigSchema = z.object({
  dg: z.string(),
  hg: z.string(),
  f: z.string().optional(),
  c: z.string().optional(),
  arq: z.array(z.object({ tp: z.string(), dir: z.string() })),
  pl: z.array(TsePleitoSchema),
});

export type TseElectionConfig = z.infer<typeof TseElectionConfigSchema>;
export type TsePleito = z.infer<typeof TsePleitoSchema>;
