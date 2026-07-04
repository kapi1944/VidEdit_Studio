import { STATUSY_ANALIZY_AUDIO } from "../audio/typyAudio";
import { walidujSciezkeAudio } from "../audio/walidacjaAudio";
import type { DaneAudioProjektu } from "../audio/typyAudio";
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

export function walidujDaneAudioProjektu(
  daneAudio: DaneAudioProjektu | null | undefined
): BladWalidacji[] {
  if (!daneAudio) {
    return [
      {
        pole: "audio",
        komunikat: "Projekt musi zawierac dane audio."
      }
    ];
  }

  const bledy: BladWalidacji[] = [];

  if (!daneAudio.statusAnalizyAudio) {
    bledy.push({
      pole: "statusAnalizyAudio",
      komunikat: "Dane audio musza miec status analizy."
    });
  } else if (!STATUSY_ANALIZY_AUDIO.includes(daneAudio.statusAnalizyAudio)) {
    bledy.push({
      pole: "statusAnalizyAudio",
      komunikat: "Status analizy audio nie jest obslugiwany."
    });
  }

  if (daneAudio.statusAnalizyAudio === "ukonczona" && !daneAudio.sciezkaAudio) {
    bledy.push({
      pole: "sciezkaAudio",
      komunikat: "Ukonczona analiza audio wymaga sciezki audio."
    });
  }

  if (
    daneAudio.statusAnalizyAudio === "blad" &&
    (!daneAudio.ostatniBladAudio ||
      daneAudio.ostatniBladAudio.trim().length === 0)
  ) {
    bledy.push({
      pole: "ostatniBladAudio",
      komunikat: "Blad analizy audio wymaga komunikatu bledu."
    });
  }

  if (!Array.isArray(daneAudio.segmentyCiszy)) {
    bledy.push({
      pole: "segmentyCiszy",
      komunikat: "Segmenty ciszy musza byc tablica."
    });
  } else {
    daneAudio.segmentyCiszy.forEach((segment) => {
      bledy.push(
        ...sprawdzCzySegmentCzasuJestPoprawny(segment).map((blad) => ({
          ...blad,
          pole: `segmentyCiszy.${blad.pole}`
        }))
      );
    });
  }

  if (daneAudio.sciezkaAudio) {
    bledy.push(
      ...walidujSciezkeAudio(daneAudio.sciezkaAudio).map((blad) => ({
        ...blad,
        pole: `sciezkaAudio.${blad.pole}`
      }))
    );
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

  bledy.push(
    ...walidujDaneAudioProjektu(projekt.audio).map((blad) => ({
      ...blad,
      pole: blad.pole === "audio" ? "audio" : `audio.${blad.pole}`
    }))
  );

  return bledy;
}
