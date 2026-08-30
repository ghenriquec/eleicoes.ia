import { createTseCandidateProvider } from "./candidates/candidate-provider";
import { createTsePhotoProvider } from "./assets/photo-provider";
import { createTseAssetsProvider } from "./assets-declaration/assets-provider";
import { createTseSocialNetworkProvider } from "./social-networks/social-network-provider";
import { createTseGovernmentProposalProvider } from "./government-proposals/government-proposal-provider";
import { createTseResultsProvider } from "./results/results-provider";
import type {
  Candidate,
  CandidateFilters,
  TseCandidateAssetsDeclarationProvider,
  TseCandidateAssetsProvider,
  TseCandidateProvider,
  TseGovernmentProposalProvider,
  TseResultsProvider,
  TseSocialNetworkProvider,
} from "./types";

export * from "./types";
export * from "./constants/offices";
export * from "./errors";
export { TSE_CONFIG } from "./config";

/**
 * Facade central (briefing "FACADE"). Uso:
 *
 * ```ts
 * const tse = new TseElectionDataProvider();
 * await tse.candidates.sync(2026);
 * const candidates = await tse.candidates.find({ state: "MG", office: ElectionOffice.GOVERNOR });
 * ```
 */
export class TseElectionDataProvider {
  readonly candidates: TseCandidateProvider & { sync: (year: number) => ReturnType<TseCandidateProvider["syncCandidates"]>; find: (f: CandidateFilters) => Promise<Candidate[]> };
  readonly photos: TseCandidateAssetsProvider;
  readonly assetsDeclaration: TseCandidateAssetsDeclarationProvider;
  readonly socialNetworks: TseSocialNetworkProvider;
  readonly governmentProposals: TseGovernmentProposalProvider;
  readonly results: TseResultsProvider;

  constructor() {
    const candidateProvider = createTseCandidateProvider();
    this.candidates = {
      ...candidateProvider,
      sync: (year: number) => candidateProvider.syncCandidates(year),
      find: (filters: CandidateFilters) => candidateProvider.getCandidates(filters),
    };
    this.photos = createTsePhotoProvider();
    this.assetsDeclaration = createTseAssetsProvider();
    this.socialNetworks = createTseSocialNetworkProvider();
    this.governmentProposals = createTseGovernmentProposalProvider();
    this.results = createTseResultsProvider();
  }
}

let sharedInstance: TseElectionDataProvider | null = null;
/** Singleton conveniente para as rotas de API — evita recriar os providers a cada request. */
export function getTseElectionDataProvider(): TseElectionDataProvider {
  if (!sharedInstance) sharedInstance = new TseElectionDataProvider();
  return sharedInstance;
}
