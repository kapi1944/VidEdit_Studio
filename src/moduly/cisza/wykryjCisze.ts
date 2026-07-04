import type { BladWalidacji } from "../../wspolne/bledy";
import { przetworzSegmentyCiszy } from "./przetworzSegmentyCiszy";
import { rzucJesliNiepoprawneUstawieniaWykrywaniaCiszy } from "./ustawieniaCiszy";
import type {
  ProbkaGlosnosciAudio,
  SurowySegmentCiszy,
  UstawieniaWykrywaniaCiszy
} from "./typyCiszy";
import type { SegmentCiszy } from "../../domena/timeline/typyTimeline";

function walidujProbkiGlosnosciAudio(
  probkiGlosnosci: ProbkaGlosnosciAudio[]
): BladWalidacji[] {
  return probkiGlosnosci.flatMap((probka, indeks) => {
    const bledy: BladWalidacji[] = [];
    const pole = `probkiGlosnosci[${indeks}]`;

    if (
      !Number.isFinite(probka.czasPoczatkuMs) ||
      !Number.isFinite(probka.czasKoncaMs)
    ) {
      bledy.push({
        pole,
        komunikat: "Czas probki glosnosci audio musi byc liczba skonczona."
      });
    }

    if (probka.czasPoczatkuMs < 0 || probka.czasKoncaMs < 0) {
      bledy.push({
        pole,
        komunikat: "Czas probki glosnosci audio nie moze byc ujemny."
      });
    }

    if (probka.czasKoncaMs <= probka.czasPoczatkuMs) {
      bledy.push({
        pole,
        komunikat: "Koniec probki glosnosci audio musi byc po jej poczatku."
      });
    }

    if (!Number.isFinite(probka.poziomDb)) {
      bledy.push({
        pole,
        komunikat: "Poziom glosnosci audio musi byc liczba skonczona."
      });
    }

    return bledy;
  });
}

function rzucJesliNiepoprawneProbki(
  probkiGlosnosci: ProbkaGlosnosciAudio[]
): void {
  const bledy = walidujProbkiGlosnosciAudio(probkiGlosnosci);

  if (bledy.length > 0) {
    throw new Error(bledy.map((blad) => blad.komunikat).join(" "));
  }
}

function posortujProbkiGlosnosci(
  probkiGlosnosci: ProbkaGlosnosciAudio[]
): ProbkaGlosnosciAudio[] {
  return probkiGlosnosci
    .map((probka) => ({ ...probka }))
    .sort((pierwsza, druga) => {
      if (pierwsza.czasPoczatkuMs !== druga.czasPoczatkuMs) {
        return pierwsza.czasPoczatkuMs - druga.czasPoczatkuMs;
      }

      return pierwsza.czasKoncaMs - druga.czasKoncaMs;
    });
}

function czyProbkaJestCisza(
  probka: ProbkaGlosnosciAudio,
  progCiszyDb: number
) {
  return probka.poziomDb <= progCiszyDb;
}

function utworzSurowySegmentZProbki(
  probka: ProbkaGlosnosciAudio,
  czasTrwaniaAudioMs: number
): SurowySegmentCiszy | undefined {
  const czasPoczatkuMs = Math.max(0, probka.czasPoczatkuMs);
  const czasKoncaMs = Math.min(czasTrwaniaAudioMs, probka.czasKoncaMs);

  if (czasKoncaMs <= czasPoczatkuMs) {
    return undefined;
  }

  const czasProbkiMs = czasKoncaMs - czasPoczatkuMs;

  return {
    czasPoczatkuMs,
    czasKoncaMs,
    lacznyCzasCiszyMs: czasProbkiMs,
    sumaPoziomowDbWazonaCzasem: probka.poziomDb * czasProbkiMs
  };
}

function polaczSasiednieSuroweSegmenty(
  pierwszy: SurowySegmentCiszy,
  drugi: SurowySegmentCiszy
): SurowySegmentCiszy {
  return {
    czasPoczatkuMs: Math.min(pierwszy.czasPoczatkuMs, drugi.czasPoczatkuMs),
    czasKoncaMs: Math.max(pierwszy.czasKoncaMs, drugi.czasKoncaMs),
    lacznyCzasCiszyMs:
      pierwszy.lacznyCzasCiszyMs + drugi.lacznyCzasCiszyMs,
    sumaPoziomowDbWazonaCzasem:
      pierwszy.sumaPoziomowDbWazonaCzasem +
      drugi.sumaPoziomowDbWazonaCzasem
  };
}

function zamknijAktywnySegment(
  suroweSegmenty: SurowySegmentCiszy[],
  aktywnySegment: SurowySegmentCiszy | undefined
) {
  if (aktywnySegment) {
    suroweSegmenty.push(aktywnySegment);
  }
}

function utworzSuroweSegmentyCiszy(
  probkiGlosnosci: ProbkaGlosnosciAudio[],
  ustawienia: UstawieniaWykrywaniaCiszy,
  czasTrwaniaAudioMs: number
): SurowySegmentCiszy[] {
  const suroweSegmenty: SurowySegmentCiszy[] = [];
  let aktywnySegment: SurowySegmentCiszy | undefined;

  for (const probka of posortujProbkiGlosnosci(probkiGlosnosci)) {
    if (!czyProbkaJestCisza(probka, ustawienia.progCiszyDb)) {
      zamknijAktywnySegment(suroweSegmenty, aktywnySegment);
      aktywnySegment = undefined;
      continue;
    }

    const segmentZProbki = utworzSurowySegmentZProbki(
      probka,
      czasTrwaniaAudioMs
    );

    if (!segmentZProbki) {
      continue;
    }

    if (
      aktywnySegment &&
      segmentZProbki.czasPoczatkuMs <= aktywnySegment.czasKoncaMs
    ) {
      aktywnySegment = polaczSasiednieSuroweSegmenty(
        aktywnySegment,
        segmentZProbki
      );
      continue;
    }

    zamknijAktywnySegment(suroweSegmenty, aktywnySegment);
    aktywnySegment = segmentZProbki;
  }

  zamknijAktywnySegment(suroweSegmenty, aktywnySegment);

  return suroweSegmenty;
}

export function wykryjCisze(
  probkiGlosnosci: ProbkaGlosnosciAudio[],
  ustawienia: UstawieniaWykrywaniaCiszy,
  czasTrwaniaAudioMs: number
): SegmentCiszy[] {
  rzucJesliNiepoprawneUstawieniaWykrywaniaCiszy(
    ustawienia,
    czasTrwaniaAudioMs
  );
  rzucJesliNiepoprawneProbki(probkiGlosnosci);

  if (probkiGlosnosci.length === 0) {
    return [];
  }

  return przetworzSegmentyCiszy(
    utworzSuroweSegmentyCiszy(
      probkiGlosnosci,
      ustawienia,
      czasTrwaniaAudioMs
    ),
    ustawienia,
    czasTrwaniaAudioMs
  );
}
