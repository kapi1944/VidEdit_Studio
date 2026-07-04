import type { SegmentCiszy } from "../../../domena/timeline/typyTimeline";
import { Pasek_Klipu } from "./Pasek_Klipu";
import { Segment_Ciszy_Na_Timeline } from "./Segment_Ciszy_Na_Timeline";
import { Znacznik_Czasu } from "./Znacznik_Czasu";

type WlasciwosciPaneluOsiCzasu = {
  nazwaProjektu: string;
  czasTrwaniaMs: number;
  czasAktualnyMs: number;
  segmentyCiszy: SegmentCiszy[];
  idAktywnegoSegmentuCiszy?: string;
  formatujCzasTimeline: (czasMs: number) => string;
  naWybranoSegmentCiszy: (segmentCiszy: SegmentCiszy) => void;
};

export function Panel_Osi_Czasu({
  nazwaProjektu,
  czasTrwaniaMs,
  czasAktualnyMs,
  segmentyCiszy,
  idAktywnegoSegmentuCiszy,
  formatujCzasTimeline,
  naWybranoSegmentCiszy
}: WlasciwosciPaneluOsiCzasu) {
  const aktywnySegmentCiszy = segmentyCiszy.find(
    (segmentCiszy) => segmentCiszy.id === idAktywnegoSegmentuCiszy
  );

  return (
    <section className="panel-osi-czasu" aria-label="Os czasu projektu">
      <div className="panel-osi-czasu__naglowek">
        <h2 className="panel-osi-czasu__tytul">Os czasu: {nazwaProjektu}</h2>
        <div className="panel-osi-czasu__metryki">
          <span>Dlugosc: {formatujCzasTimeline(czasTrwaniaMs)}</span>
          <span>Aktualny czas: {formatujCzasTimeline(czasAktualnyMs)}</span>
        </div>
      </div>

      <div className="panel-osi-czasu__tor">
        <div className="panel-osi-czasu__obszar">
          <Pasek_Klipu
            czasTrwaniaMs={czasTrwaniaMs}
            formatujCzas={formatujCzasTimeline}
          />
          <div className="panel-osi-czasu__segmenty">
            {segmentyCiszy.map((segmentCiszy) => (
              <Segment_Ciszy_Na_Timeline
                key={segmentCiszy.id}
                segmentCiszy={segmentCiszy}
                czasTrwaniaMs={czasTrwaniaMs}
                czyAktywny={segmentCiszy.id === idAktywnegoSegmentuCiszy}
                formatujCzas={formatujCzasTimeline}
                naKlikniecie={naWybranoSegmentCiszy}
              />
            ))}
          </div>
          <Znacznik_Czasu
            czasAktualnyMs={czasAktualnyMs}
            czasTrwaniaMs={czasTrwaniaMs}
            formatujCzas={formatujCzasTimeline}
          />
        </div>
      </div>

      <div className="panel-osi-czasu__podsumowanie" aria-live="polite">
        <span>Segmenty ciszy: {segmentyCiszy.length}</span>
        <span>
          Aktywny:{" "}
          {aktywnySegmentCiszy
            ? `${formatujCzasTimeline(
                aktywnySegmentCiszy.czasPoczatkuMs
              )} - ${formatujCzasTimeline(aktywnySegmentCiszy.czasKoncaMs)}`
            : "brak"}
        </span>
      </div>
    </section>
  );
}
