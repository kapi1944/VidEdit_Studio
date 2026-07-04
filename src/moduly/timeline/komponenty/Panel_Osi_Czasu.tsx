import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ZdarzenieMyszy,
  type RefObject
} from "react";
import type { SegmentCiszy } from "../../../domena/timeline/typyTimeline";
import { przeliczPozycjeNaCzas } from "../przeliczCzasNaPozycje";
import { Pasek_Klipu } from "./Pasek_Klipu";
import { Segment_Ciszy_Na_Timeline } from "./Segment_Ciszy_Na_Timeline";
import { Znacznik_Czasu } from "./Znacznik_Czasu";

type WlasciwosciPaneluOsiCzasu = {
  nazwaProjektu: string;
  czasTrwaniaMs: number;
  czasAktualnyMs: number;
  segmentyCiszy: SegmentCiszy[];
  idAktywnegoSegmentuCiszy?: string;
  uchwytWideoRef: RefObject<HTMLVideoElement | null>;
  formatujCzasTimeline: (czasMs: number) => string;
  naZmianeCzasuTimeline: (czasMs: number) => void;
  naZmianePrzeciaganiaGlowicy: (czyPrzeciaganieGlowicy: boolean) => void;
  naWybranoSegmentCiszy: (segmentCiszy: SegmentCiszy) => void;
};

export function Panel_Osi_Czasu({
  nazwaProjektu,
  czasTrwaniaMs,
  czasAktualnyMs,
  segmentyCiszy,
  idAktywnegoSegmentuCiszy,
  uchwytWideoRef,
  formatujCzasTimeline,
  naZmianeCzasuTimeline,
  naZmianePrzeciaganiaGlowicy,
  naWybranoSegmentCiszy
}: WlasciwosciPaneluOsiCzasu) {
  const uchwytTimelineRef = useRef<HTMLDivElement>(null);
  const [czyPrzeciaganieGlowicy, ustawCzyPrzeciaganieGlowicy] =
    useState(false);
  const aktywnySegmentCiszy = segmentyCiszy.find(
    (segmentCiszy) => segmentCiszy.id === idAktywnegoSegmentuCiszy
  );

  const ustawCzasZPozycjiMyszy = useCallback(
    (pozycjaMyszyX: number) => {
      const elementTimeline = uchwytTimelineRef.current;

      if (!elementTimeline || czasTrwaniaMs <= 0) {
        return;
      }

      const wymiaryTimeline = elementTimeline.getBoundingClientRect();
      const czasMs = przeliczPozycjeNaCzas(
        pozycjaMyszyX - wymiaryTimeline.left,
        wymiaryTimeline.width,
        czasTrwaniaMs
      );

      if (uchwytWideoRef.current) {
        uchwytWideoRef.current.currentTime = czasMs / 1000;
      }

      naZmianeCzasuTimeline(czasMs);
    },
    [czasTrwaniaMs, naZmianeCzasuTimeline, uchwytWideoRef]
  );

  function ustawStanPrzeciaganiaGlowicy(czyPrzeciaganie: boolean) {
    ustawCzyPrzeciaganieGlowicy(czyPrzeciaganie);
    naZmianePrzeciaganiaGlowicy(czyPrzeciaganie);
  }

  function obsluzKlikniecieTimeline(zdarzenie: ZdarzenieMyszy<HTMLDivElement>) {
    if (zdarzenie.button !== 0) {
      return;
    }

    if (
      (zdarzenie.target as Element).closest(".segment-ciszy-na-timeline") ||
      (zdarzenie.target as Element).closest(".znacznik-czasu")
    ) {
      return;
    }

    ustawCzasZPozycjiMyszy(zdarzenie.clientX);
  }

  function rozpocznijPrzeciaganieGlowicy(
    zdarzenie: ZdarzenieMyszy<HTMLButtonElement>
  ) {
    if (zdarzenie.button !== 0 || czasTrwaniaMs <= 0) {
      return;
    }

    zdarzenie.preventDefault();
    zdarzenie.stopPropagation();
    ustawStanPrzeciaganiaGlowicy(true);
    ustawCzasZPozycjiMyszy(zdarzenie.clientX);
  }

  useEffect(() => {
    if (!czyPrzeciaganieGlowicy) {
      return;
    }

    function obsluzRuchMyszy(zdarzenie: MouseEvent) {
      ustawCzasZPozycjiMyszy(zdarzenie.clientX);
    }

    function zakonczPrzeciaganieGlowicy() {
      ustawStanPrzeciaganiaGlowicy(false);
    }

    document.addEventListener("mousemove", obsluzRuchMyszy);
    document.addEventListener("mouseup", zakonczPrzeciaganieGlowicy);

    return () => {
      document.removeEventListener("mousemove", obsluzRuchMyszy);
      document.removeEventListener("mouseup", zakonczPrzeciaganieGlowicy);
    };
  }, [czyPrzeciaganieGlowicy, ustawCzasZPozycjiMyszy]);

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
        <div
          className="panel-osi-czasu__obszar"
          ref={uchwytTimelineRef}
          onMouseDown={obsluzKlikniecieTimeline}
        >
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
            uchwytWideoRef={uchwytWideoRef}
            czyPrzeciaganieGlowicy={czyPrzeciaganieGlowicy}
            formatujCzas={formatujCzasTimeline}
            naRozpocznijPrzeciaganie={rozpocznijPrzeciaganieGlowicy}
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
