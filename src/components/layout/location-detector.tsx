"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MapPin, X } from "lucide-react";
import { reverseGeocodeToUF } from "@/lib/geo/reverse-geocode";
import { getSavedUF, saveUF, wasGeoAsked, markGeoAsked, clearUF } from "@/lib/quiz/storage";
import { getState, STATES } from "@/lib/domain/states";

type Phase = "idle" | "detected" | "picking";

/**
 * Ao entrar pela primeira vez, pede a localização do navegador (prompt nativo
 * do browser — nenhuma UI própria pede permissão) e pré-seleciona o estado.
 * Só roda uma vez por dispositivo (votocerto:geo-asked) e nunca insiste se o
 * usuário negar — nesse caso a escolha manual de estado continua disponível
 * em todo o site, como sempre foi. Coordenadas nunca tocam nosso servidor.
 */
export function LocationDetector() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [detectedUF, setDetectedUF] = useState<string | null>(null);
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;
    if (getSavedUF() || wasGeoAsked()) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    markGeoAsked();
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = await reverseGeocodeToUF(position.coords.latitude, position.coords.longitude);
        if (location) {
          saveUF(location.uf, "geolocation");
          setDetectedUF(location.uf);
          setPhase("detected");
        }
      },
      () => {
        // Permissão negada ou indisponível — segue sem estado salvo, sem insistir.
      },
      { timeout: 8000, maximumAge: 10 * 60 * 1000 },
    );
  }, [isAdmin]);

  if (phase === "idle") return null;

  return (
    <div className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-sm rounded-2xl border border-border bg-surface p-4 shadow-lg md:bottom-4">
      {phase === "detected" && detectedUF && (
        <div className="flex items-start gap-3">
          <MapPin size={18} className="mt-0.5 flex-none text-accent-ink" />
          <div className="min-w-0 flex-1 text-sm">
            <p>
              Detectamos que você está em <strong>{getState(detectedUF)?.name ?? detectedUF}</strong>.
            </p>
            <div className="mt-2 flex gap-3">
              <button onClick={() => setPhase("picking")} className="font-medium text-accent-ink hover:underline">
                Não é você? Trocar
              </button>
              <button onClick={() => setPhase("idle")} className="text-taupe-ink hover:text-text">
                Ok, entendi
              </button>
            </div>
          </div>
          <button
            onClick={() => setPhase("idle")}
            aria-label="Fechar"
            className="flex-none text-taupe-ink hover:text-text"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {phase === "picking" && (
        <div className="text-sm">
          <p className="mb-2 font-medium">Em qual estado você vota?</p>
          <select
            autoFocus
            defaultValue=""
            onChange={(e) => {
              if (!e.target.value) return;
              if (e.target.value === "unset") {
                clearUF();
              } else {
                saveUF(e.target.value, "manual");
              }
              setPhase("idle");
            }}
            className="w-full rounded-xl border border-border-strong bg-bg px-3 py-2.5"
          >
            <option value="" disabled>
              Selecione…
            </option>
            {STATES.map((s) => (
              <option key={s.uf} value={s.uf}>
                {s.name} ({s.uf})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
