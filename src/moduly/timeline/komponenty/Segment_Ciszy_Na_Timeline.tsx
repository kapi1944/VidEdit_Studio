import type { SegmentCiszy } from "../../../domena/timeline/typyTimeline";
import { przeliczZakresCzasuNaPolozenie } from "../przeliczCzasNaPozycje";

type WlasciwosciSegmentuCiszyNaTimeline = {
  segmentCiszy: SegmentCiszy;
  czasTrwaniaMs: number;
  czyAktywny: boolean;
  formatujCzas: (czasMs: number) => string;
  naKlikniecie: (segmentCiszy: SegmentCiszy) => void;
};

export function Segment_Ciszy_Na_Timeline({
  segmentCiszy,
  czasTrwaniaMs,
  czyAktywny,
  formatujCzas,
  naKlikniecie
}: WlasciwosciSegmentuCiszyNaTimeline) {
  const { polozenieOdLewejProcent, szerokoscProcent } =
    przeliczZakresCzasuNaPolozenie(
      segmentCiszy.czasPoczatkuMs,
      segmentCiszy.czasKoncaMs,
      czasTrwaniaMs
    );

  if (szerokoscProcent <= 0) {
    return null;
  }

  const etykietaZakresu = `${formatujCzas(
    segmentCiszy.czasPoczatkuMs
  )} - ${formatujCzas(segmentCiszy.czasKoncaMs)}`;

  return (
    <button
      className={`segment-ciszy-na-timeline${
        czyAktywny ? " segment-ciszy-na-timeline--aktywny" : ""
      }`}
      type="button"
      style={{
        left: `${polozenieOdLewejProcent}%`,
        width: `${szerokoscProcent}%`
      }}
      aria-pressed={czyAktywny}
      aria-label={`Segment ciszy ${etykietaZakresu}`}
      title={etykietaZakresu}
      onClick={() => naKlikniecie(segmentCiszy)}
    >
      <span className="segment-ciszy-na-timeline__etykieta">cisza</span>
    </button>
  );
}
