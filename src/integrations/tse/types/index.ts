import type { ElectionOffice } from "../constants/offices";
import type { SyncError } from "../errors";

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

export interface SyncResult {
  status: "SUCCESS" | "PARTIAL" | "FAILED" | "UNCHANGED";
  source: string;
  startedAt: Date;
  finishedAt: Date;
  recordsReceived: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsRejected: number;
  checksum?: string;
  errors: SyncError[];
}

// ---------------------------------------------------------------------------
// Candidatos
// ---------------------------------------------------------------------------

export interface RawCandidateRecord {
  tseCandidateId: string;
  electionYear: number;
  uf: string;
  office: ElectionOffice;
  ballotName: string;
  fullName: string;
  ballotNumber: string;
  partyAbbreviation: string;
  partyNumber: number;
  partyName: string | null;
  federation: string | null;
  coalition: string | null;
  coalitionSqId: string | null;
  coalitionComposition: string | null;
  status: string;
  statusDescription: string | null;
  occupation: string | null;
  education: string | null;
  birthDate: string | null;
  birthplace: string | null;
  nationality: string | null;
  cpf: string | null;
  gender: string | null;
  maritalStatus: string | null;
  raceColor: string | null;
  photoUrl: string | null;
  sourceUrl: string;
  raw: Record<string, string>;
}

/** Vice-presidente/vice-governador — extraído à parte, nunca vira um Candidate completo (ver mapCandidateRow). */
export interface RawRunningMateRecord {
  tseCandidateId: string;
  uf: string;
  isPresidentialTicket: boolean; // true = VICE-PRESIDENTE, false = VICE-GOVERNADOR
  coalitionSqId: string | null;
  ballotName: string;
  fullName: string;
  ballotNumber: string;
  partyAbbreviation: string;
  partyName: string | null;
  occupation: string | null;
  education: string | null;
  birthDate: string | null;
  birthplace: string | null;
  cpf: string | null;
  gender: string | null;
  maritalStatus: string | null;
  raceColor: string | null;
}

export interface CandidateFilters {
  electionYear?: number;
  state?: string;
  office?: ElectionOffice;
  party?: string;
  query?: string;
}

export interface Candidate {
  id: string;
  slug: string;
  tseCandidateId: string;
  electionYear: number;
  state: string;
  office: ElectionOffice;
  ballotName: string;
  fullName: string;
  ballotNumber: string;
  partyNumber: number;
  partyAbbreviation: string;
  partyName: string | null;
  federation: string | null;
  coalition: string | null;
  status: string;
  occupation: string | null;
  education: string | null;
  birthDate: string | null;
  birthplace: string | null;
  nationality: string | null;
  photoUrl: string | null;
  sourceUpdatedAt: Date | null;
  declaredAssetsTotalCents: bigint;
  /** true apenas em ambiente de desenvolvimento/demo — nunca em produção (briefing §83). */
  isMockData: boolean;
}

export interface CandidatePhoto {
  candidateId: string;
  url: string;
  sourceUrl: string;
  downloadedAt: Date | null;
}

export interface CandidateAsset {
  id: string;
  candidateId: string;
  assetType: string;
  description: string;
  /** centavos — nunca float para dinheiro */
  valueCents: bigint;
  sourceId: string | null;
}

export interface GovernmentProposal {
  id: string;
  candidateId: string;
  title: string;
  originalUrl: string;
  localStoragePath: string | null;
  checksum: string | null;
  downloadedAt: Date | null;
}

// ---------------------------------------------------------------------------
// Resultados
// ---------------------------------------------------------------------------

export interface ElectionConfiguration {
  electionYear: number;
  round: number;
  /** cd_eleicao resolvido dinamicamente — nunca hardcoded. Null se o pleito ainda não foi publicado pelo TSE. */
  cdEleicao: string | null;
  votingDate: string | null;
  discoveredAt: Date;
}

export interface ElectionProgress {
  scope: string; // "BR" ou UF
  round: number;
  sectionsTotal: number;
  sectionsCounted: number;
  percentage: number;
  turnout: number | null;
  turnoutPercentage: number | null;
  abstentionPercentage: number | null;
  blankVotes: number | null;
  nullVotes: number | null;
  validVotes: number | null;
  updatedAt: Date;
  stale: boolean;
}

export interface CandidateResult {
  candidateId: string;
  ballotName: string;
  ballotNumber: string;
  runningMateName: string | null;
  party: string;
  votes: number;
  percentage: number;
  rank: number;
  /** vem do TSE como está — nunca recalculado internamente */
  officialStatus: string;
  isElected: boolean;
}

export interface OfficeResult {
  scope: string;
  office: ElectionOffice;
  round: number;
  seats: number;
  totalizationPercentage: number;
  candidates: CandidateResult[];
  updatedAt: Date;
  stale: boolean;
}

// ---------------------------------------------------------------------------
// Providers (briefing "ARQUITETURA")
// ---------------------------------------------------------------------------

export interface TseCandidateProvider {
  syncCandidates(electionYear: number): Promise<SyncResult>;
  getCandidates(filters: CandidateFilters): Promise<Candidate[]>;
  getCandidateById(id: string): Promise<Candidate | null>;
}

export interface TseCandidateAssetsProvider {
  syncPhotos(electionYear: number): Promise<SyncResult>;
  getCandidatePhoto(candidateId: string): Promise<CandidatePhoto | null>;
}

export interface TseCandidateAssetsDeclarationProvider {
  syncAssets(electionYear: number): Promise<SyncResult>;
  getCandidateAssets(candidateId: string): Promise<CandidateAsset[]>;
  getDeclaredAssetsTotal(candidateId: string): Promise<bigint>;
}

export interface TseSocialNetworkProvider {
  syncSocialNetworks(electionYear: number): Promise<SyncResult>;
}

export interface TseGovernmentProposalProvider {
  syncGovernmentProposals(electionYear: number): Promise<SyncResult>;
  getGovernmentProposal(candidateId: string): Promise<GovernmentProposal | null>;
}

export interface TseResultsProvider {
  getElectionConfiguration(round: number): Promise<ElectionConfiguration>;
  getBrazilProgress(round: number): Promise<ElectionProgress>;
  getStateProgress(uf: string, round: number): Promise<ElectionProgress>;
  getOfficeResults(uf: string, office: ElectionOffice, round: number): Promise<OfficeResult>;
  getPresidentialResults(round: number): Promise<OfficeResult>;
  getElectedCandidates(uf: string, office: ElectionOffice, round: number): Promise<CandidateResult[]>;
}
