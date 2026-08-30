import "dotenv/config";
import { discoverGeneralElectionCycle } from "@/integrations/tse/results/discover-cycle";
import { tseLog } from "@/integrations/tse/logger";

/**
 * Executável do worker de descoberta/apuração (blueprint §17). Uso:
 * `npm run tse:sync-results`. Pensado para rodar via cron externo no
 * intervalo de TSE_RESULTS_DISCOVERY_INTERVAL enquanto o pleito não é
 * publicado, e de TSE_RESULTS_SYNC_INTERVAL depois que ele aparecer —
 * nunca um loop `while(true)` sem controle dentro do processo Node.
 */
async function main() {
  for (const round of [1, 2] as const) {
    tseLog.info("tse_results_discovery_check", { round });
    const cycle = await discoverGeneralElectionCycle(round);
    if (cycle) {
      tseLog.info("tse_results_cycle_discovered", { round, cdEleicao: cycle.cdEleicao, votingDate: cycle.votingDate });
    } else {
      tseLog.info("tse_results_cycle_not_yet_published", { round });
    }
  }
}

main().catch((err) => {
  tseLog.error("tse_worker_crashed", { worker: "tse-result-sync", message: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
