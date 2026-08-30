import { OfficialResourceNotConfirmedError } from "../errors";
import type { SyncResult, TseSocialNetworkProvider } from "../types";

export function createTseSocialNetworkProvider(): TseSocialNetworkProvider {
  return {
    async syncSocialNetworks(): Promise<SyncResult> {
      throw new OfficialResourceNotConfirmedError("rede_social_candidato");
    },
  };
}
