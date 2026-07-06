import { DOMYSLNA_LICZBA_KLATEK_NA_SEKUNDE, WERSJA_MODELU_PROJEKTU } from "../../wspolne/stale";
import { DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE } from "../timeline/typyTimeline";
import type { ProjektMontazu } from "./typyProjektu";

function utworzIdProjektu() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `projekt-${Date.now()}`;
}

export function utworzPustyProjekt(nazwa: string): ProjektMontazu {
  const dataIso = new Date().toISOString();

  return {
    id: utworzIdProjektu(),
    nazwa,
    wersjaModelu: WERSJA_MODELU_PROJEKTU,
    dataUtworzeniaIso: dataIso,
    dataModyfikacjiIso: dataIso,
    ustawienia: {
      formatWyswietlaniaCzasu: "czas",
      liczbaKlatekNaSekunde: DOMYSLNA_LICZBA_KLATEK_NA_SEKUNDE
    },
    media: [],
    audio: {
      statusAnalizyAudio: "brak",
      segmentyCiszy: []
    },
    timeline: {
      klipy: [],
      markery: [],
      ustawieniaDociagania: DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE,
      segmentyCiszy: [],
      propozycjeCiec: []
    }
  };
}
