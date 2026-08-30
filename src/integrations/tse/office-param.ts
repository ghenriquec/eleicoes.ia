import { ElectionOffice } from "./constants/offices";

const ALIASES: Record<string, ElectionOffice> = {
  president: ElectionOffice.PRESIDENT,
  presidente: ElectionOffice.PRESIDENT,
  governor: ElectionOffice.GOVERNOR,
  governador: ElectionOffice.GOVERNOR,
  senator: ElectionOffice.SENATOR,
  senador: ElectionOffice.SENATOR,
  senate: ElectionOffice.SENATOR,
  "federal-deputy": ElectionOffice.FEDERAL_DEPUTY,
  deputado_federal: ElectionOffice.FEDERAL_DEPUTY,
  "deputado-federal": ElectionOffice.FEDERAL_DEPUTY,
  "state-deputy": ElectionOffice.STATE_DEPUTY,
  "deputado-estadual": ElectionOffice.STATE_DEPUTY,
  "district-deputy": ElectionOffice.DISTRICT_DEPUTY,
  "deputado-distrital": ElectionOffice.DISTRICT_DEPUTY,
};

/** Aceita valores em PT ou EN, maiúsculo ou minúsculo — nunca expõe ao chamador o enum interno como obrigatório. */
export function parseOfficeParam(value: string | null): ElectionOffice | null {
  if (!value) return null;
  const key = value.trim().toLowerCase();
  return ALIASES[key] ?? (Object.values(ElectionOffice).includes(value.toUpperCase() as ElectionOffice) ? (value.toUpperCase() as ElectionOffice) : null);
}
