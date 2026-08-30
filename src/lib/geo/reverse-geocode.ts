import { isValidUF } from "@/lib/domain/states";

/**
 * Geocodificação reversa client-side — nunca passa pelo nosso backend.
 * Usa o endpoint gratuito e sem chave da BigDataCloud, feito especificamente
 * para chamadas diretas do navegador (CORS liberado, sem servidor
 * intermediário). Ver https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api
 * Coordenadas do usuário nunca são enviadas a lugar nenhum além deste
 * endpoint de terceiro — nem ao nosso servidor, nem armazenadas.
 */
const REVERSE_GEOCODE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

interface BigDataCloudResponse {
  countryCode?: string;
  principalSubdivisionCode?: string; // formato "BR-MG"
  principalSubdivision?: string; // "Minas Gerais"
}

export interface DetectedLocation {
  uf: string;
  stateName: string | null;
}

async function callReverseGeocode(params: Record<string, string>): Promise<BigDataCloudResponse | null> {
  const url = new URL(REVERSE_GEOCODE_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as BigDataCloudResponse;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function parseUF(data: BigDataCloudResponse | null): DetectedLocation | null {
  if (!data || data.countryCode !== "BR" || !data.principalSubdivisionCode) return null;
  const uf = data.principalSubdivisionCode.split("-")[1]?.toUpperCase();
  if (!uf || !isValidUF(uf)) return null;
  return { uf, stateName: data.principalSubdivision ?? null };
}

/** A partir de coordenadas de GPS precisas (navigator.geolocation). */
export async function reverseGeocodeToUF(latitude: number, longitude: number): Promise<DetectedLocation | null> {
  const data = await callReverseGeocode({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: "pt",
  });
  return parseUF(data);
}
