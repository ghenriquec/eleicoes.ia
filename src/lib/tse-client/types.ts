/**
 * Contratos dos adapters do TSE (briefing §62). O domínio da aplicação depende
 * apenas destas interfaces — nunca de um provider concreto — para que trocar
 * "mock" por "produção" seja uma troca de implementação, não de chamadores.
 */

export interface RawCandidateRecord {
  tseCandidateId: string;
  electionYear: number;
  uf: string;
  officeSlug: string;
  ballotName: string;
  fullName: string;
  ballotNumber: string;
  partyAcronym: string;
  partyTseNumber: number;
  coalitionName: string | null;
  status: string;
  statusDescription: string | null;
  occupation: string | null;
  educationLevel: string | null;
  birthYear: number | null;
  placeOfBirth: string | null;
  nationality: string | null;
  photoUrl: string | null;
  sourceUrl: string;
  /** payload bruto completo, preservado sem transformação (camada RAW) */
  raw: Record<string, unknown>;
}

export interface RawAssetRecord {
  tseCandidateId: string;
  assetType: string;
  description: string;
  valueCents: bigint;
  declaredAt: string | null;
}

export interface RawSocialNetworkRecord {
  tseCandidateId: string;
  platform: string;
  url: string;
}

export interface TseCandidateProvider {
  /** Nome legível da fonte, para logging/DataSyncLog. */
  readonly sourceName: string;
  fetchCandidates(electionYear: number): Promise<RawCandidateRecord[]>;
  fetchAssets(electionYear: number): Promise<RawAssetRecord[]>;
  fetchSocialNetworks(electionYear: number): Promise<RawSocialNetworkRecord[]>;
}

export interface OfficeResultRow {
  candidateTseId: string;
  ballotName: string;
  ballotNumber: string;
  partyAcronym: string;
  votes: bigint;
  percentage: number;
  situation: string;
}

export interface ProgressSummary {
  scope: string;
  round: number;
  sectionsTotal: number;
  sectionsCounted: number;
  percentage: number;
  tseGeneratedAt: string | null;
}

export interface TseResultsProvider {
  readonly sourceName: string;
  getElectionConfiguration(): Promise<{ year: number; currentRound: number }>;
  getBrazilProgress(round: number): Promise<ProgressSummary>;
  getStateProgress(uf: string, round: number): Promise<ProgressSummary>;
  getOfficeResults(uf: string, officeSlug: string, round: number): Promise<OfficeResultRow[]>;
  getPresidentialResults(round: number): Promise<OfficeResultRow[]>;
  getElectedCandidates(uf: string, officeSlug: string, round: number): Promise<OfficeResultRow[]>;
  getUnifiedResults(uf: string, round: number): Promise<Record<string, unknown>>;
}

export interface TseDocumentProvider {
  readonly sourceName: string;
  fetchGovernmentProposalUrl(tseCandidateId: string): Promise<string | null>;
}

export interface TsePhotoProvider {
  readonly sourceName: string;
  photoUrlFor(tseCandidateId: string): string | null;
}
