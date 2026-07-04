import type { SegmentCiszy } from "../../domena/timeline/typyTimeline";
import { rzucJesliNiepoprawneUstawieniaWykrywaniaCiszy } from "./ustawieniaCiszy";
import type {
  SurowySegmentCiszy,
  UstawieniaWykrywaniaCiszy
} from "./typyCiszy";

type SegmentDoPrzetworzenia = SurowySegmentCiszy;

function ograniczCzasDoZakresu(czasMs: number, czasTrwaniaAudioMs: number) {
  return Math.min(Math.max(czasMs, 0), czasTrwaniaAudioMs);
}

function obliczCzasTrwania(segment: Pick<SegmentDoPrzetworzenia, "czasPoczatkuMs" | "czasKoncaMs">) {
  return segment.czasKoncaMs - segment.czasPoczatkuMs;
}

function przygotujSegmenty(
  segmenty: SegmentDoPrzetworzenia[]
): SegmentDoPrzetworzenia[] {
  return segmenty
    .filter(
      (segment) =>
        Number.isFinite(segment.czasPoczatkuMs) &&
        Number.isFinite(segment.czasKoncaMs) &&
        segment.czasPoczatkuMs >= 0 &&
        segment.czasKoncaMs > segment.czasPoczatkuMs
    )
    .map((segment) => ({ ...segment }))
    .sort((pierwszy, drugi) => {
      if (pierwszy.czasPoczatkuMs !== drugi.czasPoczatkuMs) {
        return pierwszy.czasPoczatkuMs - drugi.czasPoczatkuMs;
      }

      return pierwszy.czasKoncaMs - drugi.czasKoncaMs;
    });
}

function scalDwaSegmenty(
  pierwszy: SegmentDoPrzetworzenia,
  drugi: SegmentDoPrzetworzenia
): SegmentDoPrzetworzenia {
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

function scalBliskieSegmenty(
  segmenty: SegmentDoPrzetworzenia[],
  minimalnaPrzerwaMiedzySegmentamiMs: number
): SegmentDoPrzetworzenia[] {
  const scaloneSegmenty: SegmentDoPrzetworzenia[] = [];

  for (const segment of przygotujSegmenty(segmenty)) {
    const ostatniSegment = scaloneSegmenty.at(-1);

    if (!ostatniSegment) {
      scaloneSegmenty.push(segment);
      continue;
    }

    const przerwaMs = segment.czasPoczatkuMs - ostatniSegment.czasKoncaMs;

    if (przerwaMs < minimalnaPrzerwaMiedzySegmentamiMs) {
      scaloneSegmenty[scaloneSegmenty.length - 1] = scalDwaSegmenty(
        ostatniSegment,
        segment
      );
      continue;
    }

    scaloneSegmenty.push(segment);
  }

  return scaloneSegmenty;
}

function dodajMarginesy(
  segment: SegmentDoPrzetworzenia,
  ustawienia: UstawieniaWykrywaniaCiszy,
  czasTrwaniaAudioMs: number
): SegmentDoPrzetworzenia | undefined {
  const czasPoczatkuMs = ograniczCzasDoZakresu(
    segment.czasPoczatkuMs - ustawienia.marginesPrzedMs,
    czasTrwaniaAudioMs
  );
  const czasKoncaMs = ograniczCzasDoZakresu(
    segment.czasKoncaMs + ustawienia.marginesPoMs,
    czasTrwaniaAudioMs
  );

  if (czasKoncaMs <= czasPoczatkuMs) {
    return undefined;
  }

  return {
    ...segment,
    czasPoczatkuMs,
    czasKoncaMs
  };
}

function obliczSredniPoziomDb(segment: SegmentDoPrzetworzenia) {
  if (segment.lacznyCzasCiszyMs <= 0) {
    return undefined;
  }

  return Number(
    (segment.sumaPoziomowDbWazonaCzasem / segment.lacznyCzasCiszyMs).toFixed(2)
  );
}

function utworzSegmentCiszy(
  segment: SegmentDoPrzetworzenia,
  indeks: number
): SegmentCiszy {
  return {
    id: `cisza-${indeks + 1}`,
    czasPoczatkuMs: segment.czasPoczatkuMs,
    czasKoncaMs: segment.czasKoncaMs,
    status: "oczekuje",
    poziomGlosnosciDb: obliczSredniPoziomDb(segment)
  };
}

export function przetworzSegmentyCiszy(
  suroweSegmenty: SurowySegmentCiszy[],
  ustawienia: UstawieniaWykrywaniaCiszy,
  czasTrwaniaAudioMs: number
): SegmentCiszy[] {
  rzucJesliNiepoprawneUstawieniaWykrywaniaCiszy(
    ustawienia,
    czasTrwaniaAudioMs
  );

  const scaloneSuroweSegmenty = scalBliskieSegmenty(
    suroweSegmenty,
    ustawienia.minimalnaPrzerwaMiedzySegmentamiMs
  );

  const segmentyPoMarginesach = scaloneSuroweSegmenty
    .filter(
      (segment) =>
        obliczCzasTrwania(segment) >= ustawienia.minimalnaDlugoscCiszyMs
    )
    .map((segment) => dodajMarginesy(segment, ustawienia, czasTrwaniaAudioMs))
    .filter(
      (segment): segment is SegmentDoPrzetworzenia => segment !== undefined
    );

  return scalBliskieSegmenty(
    segmentyPoMarginesach,
    ustawienia.minimalnaPrzerwaMiedzySegmentamiMs
  ).map(utworzSegmentCiszy);
}
