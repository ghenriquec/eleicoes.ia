import { TSE_CONFIG } from "./config";
import type { RawAssetRecord, RawCandidateRecord, RawSocialNetworkRecord, TseCandidateProvider } from "./types";

/**
 * Adapter real do Portal de Dados Abertos do TSE.
 *
 * O portal roda sobre CKAN (plataforma de dados abertos usada por diversos
 * órgãos públicos) — `package_show` é a action padrão e documentada do CKAN
 * para listar os recursos (CSV/JSON) de um dataset, não uma URL inventada
 * para o TSE especificamente.
 *
 * IMPORTANTE: nesta sessão de desenvolvimento, todo acesso automatizado a
 * *.tse.jus.br retornou HTTP 403 (bloqueio de borda/Akamai para o IP deste
 * ambiente) — ver docs/tse-integration.md. Este adapter está implementado
 * conforme a documentação pública do CKAN e a estrutura observada do portal,
 * mas NUNCA foi executado com sucesso contra o TSE real. Antes de usar em
 * produção: validar a partir de uma rede permitida e revisar o schema de
 * resposta com um payload real.
 */

const CKAN_BASE = "https://dadosabertos.tse.jus.br";
const DATASET_ID = "candidatos-2026";

interface CkanResource {
  id: string;
  name: string;
  format: string;
  url: string;
}

interface CkanPackageShowResponse {
  success: boolean;
  result: {
    resources: CkanResource[];
  };
}

async function fetchDatasetResources(): Promise<CkanResource[]> {
  const res = await fetch(`${CKAN_BASE}/api/3/action/package_show?id=${DATASET_ID}`, {
    headers: { "User-Agent": "votocerto.ia-ingestion/1.0 (+https://votocerto.ia)" },
  });
  if (!res.ok) {
    throw new Error(`Falha ao consultar o dataset ${DATASET_ID} no Portal de Dados Abertos do TSE: HTTP ${res.status}`);
  }
  const json = (await res.json()) as CkanPackageShowResponse;
  if (!json.success) {
    throw new Error("Portal de Dados Abertos do TSE retornou success=false para package_show.");
  }
  return json.result.resources;
}

function findResource(resources: CkanResource[], nameIncludes: string, format = "CSV"): CkanResource | undefined {
  const needle = nameIncludes.toLowerCase();
  return resources.find(
    (r) => r.name.toLowerCase().includes(needle) && r.format.toUpperCase() === format,
  );
}

/** Parser simples de CSV ponto-e-vírgula, no padrão publicado pelo TSE (latin1, ';'-separado). */
function parseSemicolonCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0].split(";").map((h) => h.replace(/"/g, "").trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(";").map((c) => c.replace(/"/g, "").trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

export const productionCandidateProvider: TseCandidateProvider = {
  sourceName: "TSE — Portal de Dados Abertos (Candidatos 2026)",

  async fetchCandidates(electionYear: number): Promise<RawCandidateRecord[]> {
    const resources = await fetchDatasetResources();
    const candidatesResource = findResource(resources, "candidatos");
    if (!candidatesResource) {
      throw new Error(
        `Recurso "Candidatos" não encontrado no dataset ${DATASET_ID}. O portal pode ter alterado a nomenclatura — revisar docs/tse-integration.md.`,
      );
    }
    const res = await fetch(candidatesResource.url);
    const buffer = await res.arrayBuffer();
    // O TSE publica esses CSVs em latin1 (ISO-8859-1), não UTF-8.
    const text = new TextDecoder("iso-8859-1").decode(buffer);
    const rows = parseSemicolonCsv(text);

    return rows
      .filter((row) => Number(row["ANO_ELEICAO"]) === electionYear)
      .map((row) => ({
        tseCandidateId: row["SQ_CANDIDATO"],
        electionYear,
        uf: row["SG_UF"],
        officeSlug: mapCargoToOfficeSlug(row["DS_CARGO"]),
        ballotName: row["NM_URNA_CANDIDATO"],
        fullName: row["NM_CANDIDATO"],
        ballotNumber: row["NR_CANDIDATO"],
        partyAcronym: row["SG_PARTIDO"],
        partyTseNumber: Number(row["NR_PARTIDO"]),
        coalitionName: row["NM_COLIGACAO"] || null,
        status: row["DS_SIT_TOT_TURNO"] || row["CD_SITUACAO_CANDIDATURA"],
        statusDescription: row["DS_SITUACAO_CANDIDATURA"] || null,
        occupation: row["DS_OCUPACAO"] || null,
        educationLevel: row["DS_GRAU_INSTRUCAO"] || null,
        birthYear: row["DT_NASCIMENTO"] ? Number(row["DT_NASCIMENTO"].slice(-4)) : null,
        placeOfBirth: row["NM_MUNICIPIO_NASCIMENTO"] || null,
        nationality: row["DS_NACIONALIDADE"] || null,
        photoUrl: null,
        sourceUrl: candidatesResource.url,
        raw: row,
      }));
  },

  async fetchAssets(): Promise<RawAssetRecord[]> {
    const resources = await fetchDatasetResources();
    const assetsResource = findResource(resources, "bens");
    if (!assetsResource) {
      throw new Error(`Recurso "Bens de candidatos" não encontrado no dataset ${DATASET_ID}.`);
    }
    const res = await fetch(assetsResource.url);
    const buffer = await res.arrayBuffer();
    const text = new TextDecoder("iso-8859-1").decode(buffer);
    const rows = parseSemicolonCsv(text);
    return rows.map((row) => ({
      tseCandidateId: row["SQ_CANDIDATO"],
      assetType: row["DS_TIPO_BEM_CANDIDATO"],
      description: row["DS_BEM_CANDIDATO"],
      valueCents: BigInt(Math.round(parseFloat((row["VR_BEM_CANDIDATO"] || "0").replace(",", ".")) * 100)),
      declaredAt: row["DT_ULTIMA_ATUALIZACAO"] || null,
    }));
  },

  async fetchSocialNetworks(): Promise<RawSocialNetworkRecord[]> {
    const resources = await fetchDatasetResources();
    const resource = findResource(resources, "redes sociais");
    if (!resource) {
      throw new Error(`Recurso "Redes sociais de candidatos" não encontrado no dataset ${DATASET_ID}.`);
    }
    const res = await fetch(resource.url);
    const buffer = await res.arrayBuffer();
    const text = new TextDecoder("iso-8859-1").decode(buffer);
    const rows = parseSemicolonCsv(text);
    return rows.map((row) => ({
      tseCandidateId: row["SQ_CANDIDATO"],
      platform: row["DS_URL"]?.includes("instagram")
        ? "instagram"
        : row["DS_URL"]?.includes("facebook")
          ? "facebook"
          : "outro",
      url: row["DS_URL"],
    }));
  },
};

function mapCargoToOfficeSlug(dsCargo: string): string {
  const normalized = dsCargo.trim().toUpperCase();
  const map: Record<string, string> = {
    "DEPUTADO FEDERAL": "deputado-federal",
    "DEPUTADO ESTADUAL": "deputado-estadual",
    "DEPUTADO DISTRITAL": "deputado-distrital",
    SENADOR: "senador",
    GOVERNADOR: "governador",
    "PRESIDENTE": "presidente",
  };
  return map[normalized] ?? normalized.toLowerCase().replace(/\s+/g, "-");
}

// Reexportado para uso pelo results provider (mesma config, mesmas ressalvas de rede).
export { TSE_CONFIG };
