import "dotenv/config";
import { syncCandidates } from "@/integrations/tse/candidates/candidate-sync";
import { tseLog } from "@/integrations/tse/logger";

/**
 * Executável do worker de sincronização de candidatos (blueprint §16).
 * Uso: `npm run tse:sync-candidates`. Em produção, agendar via cron/BullMQ
 * repeatable job no intervalo de TSE_CANDIDATES_SYNC_INTERVAL — nunca a
 * cada request.
 */
async function main() {
  const year = Number(process.argv[2] ?? 2026);
  tseLog.info("tse_worker_start", { worker: "tse-candidate-sync", electionYear: year });

  const result = await syncCandidates(year);

  tseLog.info("tse_worker_finished", { worker: "tse-candidate-sync", status: result.status });
  console.log(JSON.stringify(result, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2));

  if (result.status === "FAILED") process.exit(1);
}

main().catch((err) => {
  tseLog.error("tse_worker_crashed", { worker: "tse-candidate-sync", message: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
