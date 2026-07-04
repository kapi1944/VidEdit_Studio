import type { BladWalidacji } from "../../wspolne/bledy";
import type { UstawieniaWykrywaniaCiszy } from "./typyCiszy";

export const DOMYSLNE_USTAWIENIA_WYKRYWANIA_CISZY: UstawieniaWykrywaniaCiszy =
  {
    progCiszyDb: -45,
    minimalnaDlugoscCiszyMs: 500,
    marginesPrzedMs: 80,
    marginesPoMs: 120,
    minimalnaPrzerwaMiedzySegmentamiMs: 200
  };

export function walidujUstawieniaWykrywaniaCiszy(
  ustawienia: UstawieniaWykrywaniaCiszy,
  czasTrwaniaAudioMs: number
): BladWalidacji[] {
  const bledy: BladWalidacji[] = [];

  if (!Number.isFinite(ustawienia.progCiszyDb)) {
    bledy.push({
      pole: "progCiszyDb",
      komunikat: "Prog ciszy musi byc liczba skonczona."
    });
  }

  if (
    !Number.isFinite(ustawienia.minimalnaDlugoscCiszyMs) ||
    ustawienia.minimalnaDlugoscCiszyMs <= 0
  ) {
    bledy.push({
      pole: "minimalnaDlugoscCiszyMs",
      komunikat: "Minimalna dlugosc ciszy musi byc wieksza od zera."
    });
  }

  if (
    !Number.isFinite(ustawienia.marginesPrzedMs) ||
    ustawienia.marginesPrzedMs < 0
  ) {
    bledy.push({
      pole: "marginesPrzedMs",
      komunikat: "Margines przed cisza nie moze byc ujemny."
    });
  }

  if (
    !Number.isFinite(ustawienia.marginesPoMs) ||
    ustawienia.marginesPoMs < 0
  ) {
    bledy.push({
      pole: "marginesPoMs",
      komunikat: "Margines po ciszy nie moze byc ujemny."
    });
  }

  if (
    !Number.isFinite(ustawienia.minimalnaPrzerwaMiedzySegmentamiMs) ||
    ustawienia.minimalnaPrzerwaMiedzySegmentamiMs < 0
  ) {
    bledy.push({
      pole: "minimalnaPrzerwaMiedzySegmentamiMs",
      komunikat: "Minimalna przerwa miedzy segmentami nie moze byc ujemna."
    });
  }

  if (!Number.isFinite(czasTrwaniaAudioMs) || czasTrwaniaAudioMs <= 0) {
    bledy.push({
      pole: "czasTrwaniaAudioMs",
      komunikat: "Czas trwania audio musi byc wiekszy od zera."
    });
  }

  return bledy;
}

export function rzucJesliNiepoprawneUstawieniaWykrywaniaCiszy(
  ustawienia: UstawieniaWykrywaniaCiszy,
  czasTrwaniaAudioMs: number
): void {
  const bledy = walidujUstawieniaWykrywaniaCiszy(
    ustawienia,
    czasTrwaniaAudioMs
  );

  if (bledy.length > 0) {
    throw new Error(bledy.map((blad) => blad.komunikat).join(" "));
  }
}
