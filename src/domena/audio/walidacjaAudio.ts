import type { BladWalidacji } from "../../wspolne/bledy";
import type { SciezkaAudio } from "./typyAudio";

export function walidujSciezkeAudio(
  sciezkaAudio: SciezkaAudio
): BladWalidacji[] {
  const bledy: BladWalidacji[] = [];

  if (sciezkaAudio.id.trim().length === 0) {
    bledy.push({
      pole: "id",
      komunikat: "Sciezka audio musi miec identyfikator."
    });
  }

  if (sciezkaAudio.sciezkaPlikuZrodlowego.trim().length === 0) {
    bledy.push({
      pole: "sciezkaPlikuZrodlowego",
      komunikat: "Sciezka audio musi wskazywac plik zrodlowy."
    });
  }

  if (sciezkaAudio.sciezkaPlikuAudio.trim().length === 0) {
    bledy.push({
      pole: "sciezkaPlikuAudio",
      komunikat: "Sciezka audio musi wskazywac plik audio."
    });
  }

  if (
    !Number.isFinite(sciezkaAudio.czasTrwaniaMs) ||
    sciezkaAudio.czasTrwaniaMs <= 0
  ) {
    bledy.push({
      pole: "czasTrwaniaMs",
      komunikat: "Czas trwania audio musi byc wiekszy od zera."
    });
  }

  if (
    !Number.isFinite(sciezkaAudio.liczbaKanalow) ||
    sciezkaAudio.liczbaKanalow <= 0
  ) {
    bledy.push({
      pole: "liczbaKanalow",
      komunikat: "Liczba kanalow audio musi byc wieksza od zera."
    });
  }

  if (
    !Number.isFinite(sciezkaAudio.probkowanieHz) ||
    sciezkaAudio.probkowanieHz <= 0
  ) {
    bledy.push({
      pole: "probkowanieHz",
      komunikat: "Probkowanie audio musi byc wieksze od zera."
    });
  }

  if (sciezkaAudio.format !== "wav") {
    bledy.push({
      pole: "format",
      komunikat: "Sciezka audio obsluguje tylko format wav."
    });
  }

  return bledy;
}
