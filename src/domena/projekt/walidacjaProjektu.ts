import { OBSLUGIWANE_FORMATY_CZASU } from "../czas/typyCzasu";
import type { CzasMs } from "../czas/typyCzasu";
import type { SegmentCzasu } from "../timeline/typyTimeline";
import type { BladWalidacji } from "../../wspolne/bledy";
import type { ProjektMontazu } from "./typyProjektu";

export function sprawdzCzyCzasJestPoprawny(czasMs: CzasMs): BladWalidacji[] {
  if (!Number.isInteger(czasMs)) {
    return [
      {
        pole: "czasMs",
        komunikat: "Czas musi być liczbą całkowitą milisekund."
      }
    ];
  }

  if (czasMs < 0) {
    return [
      {
        pole: "czasMs",
        komunikat: "Czas nie może być ujemny."
      }
    ];
  }

  return [];
}

export function sprawdzCzySegmentCzasuJestPoprawny(
  segment: SegmentCzasu
): BladWalidacji[] {
  const bledy: BladWalidacji[] = [
    ...sprawdzCzyCzasJestPoprawny(segment.czasPoczatkuMs).map((blad) => ({
      ...blad,
      pole: "czasPoczatkuMs"
    })),
    ...sprawdzCzyCzasJestPoprawny(segment.czasKoncaMs).map((blad) => ({
      ...blad,
      pole: "czasKoncaMs"
    }))
  ];

  if (segment.czasKoncaMs <= segment.czasPoczatkuMs) {
    bledy.push({
      pole: "czasKoncaMs",
      komunikat: "Czas końca segmentu musi być większy niż czas początku."
    });
  }

  return bledy;
}

export function sprawdzCzyProjektJestPoprawny(
  projekt: ProjektMontazu
): BladWalidacji[] {
  const bledy: BladWalidacji[] = [];

  if (projekt.nazwa.trim().length === 0) {
    bledy.push({
      pole: "nazwa",
      komunikat: "Nazwa projektu nie może być pusta."
    });
  }

  if (!Number.isInteger(projekt.wersjaModelu) || projekt.wersjaModelu <= 0) {
    bledy.push({
      pole: "wersjaModelu",
      komunikat: "Projekt musi mieć poprawną wersję modelu."
    });
  }

  if (
    !OBSLUGIWANE_FORMATY_CZASU.includes(
      projekt.ustawienia.formatWyswietlaniaCzasu
    )
  ) {
    bledy.push({
      pole: "formatWyswietlaniaCzasu",
      komunikat: "Format wyświetlania czasu nie jest obsługiwany."
    });
  }

  if (
    !Number.isFinite(projekt.ustawienia.liczbaKlatekNaSekunde) ||
    projekt.ustawienia.liczbaKlatekNaSekunde <= 0
  ) {
    bledy.push({
      pole: "liczbaKlatekNaSekunde",
      komunikat: "Liczba klatek na sekundę musi być większa od zera."
    });
  }

  projekt.timeline.segmentyCiszy.forEach((segment) => {
    bledy.push(...sprawdzCzySegmentCzasuJestPoprawny(segment));
  });

  projekt.timeline.propozycjeCiec.forEach((propozycja) => {
    bledy.push(...sprawdzCzySegmentCzasuJestPoprawny(propozycja));
  });

  return bledy;
}
