import { syncSocialNetworks as syncSocialNetworksImpl } from "./social-network-sync";
import type { SyncResult, TseSocialNetworkProvider } from "../types";

/**
 * Confirmado contra um payload real em 30/08/2026 — ver
 * docs/tse-integration.md §5.
 */
export function createTseSocialNetworkProvider(): TseSocialNetworkProvider {
  return {
    async syncSocialNetworks(electionYear: number): Promise<SyncResult> {
      return syncSocialNetworksImpl(electionYear);
    },
  };
}
