import type { PlikMediow } from "../../domena/media/typyMediow";
import type { KlipTimeline } from "../../domena/timeline/typyTimeline";
import { obliczCzasKoncaKlipu } from "../../domena/timeline/typyTimeline";
import type {
  PodgladMedium,
  PodgladyMediow
} from "../../moduly/media/typyPodgladuMediow";

export function znajdzAktywnyKlipTimeline(
  klipy: KlipTimeline[],
  czasTimelineMs: number
): KlipTimeline | undefined {
  return klipy.find(
    (klip) =>
      czasTimelineMs >= klip.czasStartuMs &&
      czasTimelineMs < obliczCzasKoncaKlipu(klip)
  );
}

export function znajdzMediumDlaKlipu(
  media: PlikMediow[],
  klip?: KlipTimeline
): PlikMediow | undefined {
  if (!klip) {
    return undefined;
  }

  return media.find((medium) => medium.id === klip.idPlikuMediow);
}

export function pobierzPodgladDlaMedium(
  podgladyMediow: PodgladyMediow,
  medium?: PlikMediow
): PodgladMedium | undefined {
  if (!medium) {
    return undefined;
  }

  return podgladyMediow[medium.id];
}

export function obliczCzasPodgladuKlipu(
  klip: KlipTimeline,
  czasTimelineMs: number
) {
  const czasWKlipieMs = Math.max(0, czasTimelineMs - klip.czasStartuMs);
  const czasWKlipieOgraniczonyMs = Math.min(
    czasWKlipieMs,
    klip.czasTrwaniaMs
  );

  return (klip.zrodloStartMs ?? 0) + czasWKlipieOgraniczonyMs;
}
