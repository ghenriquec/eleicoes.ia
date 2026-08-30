import { TseIntegrationError } from "./index";

/**
 * O pleito ainda não foi publicado pelo TSE em ele-c.json — estado normal
 * antes da eleição (docs/tse-integration.md §3), diferente de uma falha.
 * A API interna converte isso em "Dado ainda não disponibilizado pelo TSE.",
 * nunca em erro 500 nem em zero silencioso.
 */
export class ElectionNotYetPublishedError extends TseIntegrationError {
  constructor(round: number) {
    super(`O TSE ainda não publicou o pleito do ${round}º turno das Eleições 2026 em ele-c.json.`, { round });
    this.name = "ElectionNotYetPublishedError";
  }
}
