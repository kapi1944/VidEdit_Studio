import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent as ZdarzenieMyszy,
  type RefObject
} from "react";
import type {
  KlipTimeline,
  SegmentCiszy,
  UstawieniaSiatkiTimeline
} from "../../../domena/timeline/typyTimeline";
import {
  DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE,
  opiszTrybSiatkiTimeline,
  USTAWIENIA_DOCIAGANIA_TIMELINE_MVP
} from "../../../domena/timeline/typyTimeline";
import { przeliczPozycjeNaCzas } from "../przeliczCzasNaPozycje";
import { Pasek_Klipu } from "./Pasek_Klipu";
import { Segment_Ciszy_Na_Timeline } from "./Segment_Ciszy_Na_Timeline";
import { Znacznik_Czasu } from "./Znacznik_Czasu";

type WlasciwosciPaneluOsiCzasu = {
  nazwaProjektu: string;
  klipyTimeline: KlipTimeline[];
  czasTrwaniaMs: number;
  czasAktualnyMs: number;
  segmentyCiszy: SegmentCiszy[];
  idAktywnegoSegmentuCiszy?: string;
  idZaznaczonegoKlipuTimeline?: string;
  uchwytWideoRef: RefObject<HTMLVideoElement | null>;
  formatujCzasTimeline: (czasMs: number) => string;
  ustawieniaSiatkiTimeline?: UstawieniaSiatkiTimeline;
  opcjeSiatkiTimeline?: UstawieniaSiatkiTimeline[];
  naZmianeCzasuTimeline: (czasMs: number) => void;
  naZmianeUstawienSiatkiTimeline?: (
    ustawieniaSiatki: UstawieniaSiatkiTimeline
  ) => void;
  naZaznaczKlipTimeline?: (idKlipu: string) => void;
  naPrzetnijZaznaczonyKlip?: () => void;
  naPrzesunZaznaczonyKlipWLewo?: () => void;
  naPrzesunZaznaczonyKlipWPrawo?: () => void;
  naSkrocPoczatekZaznaczonegoKlipu?: () => void;
  naSkrocKoniecZaznaczonegoKlipu?: () => void;
  naZmianePrzeciaganiaGlowicy: (czyPrzeciaganieGlowicy: boolean) => void;
  naWybranoSegmentCiszy: (segmentCiszy: SegmentCiszy) => void;
};

export function Panel_Osi_Czasu({
  nazwaProjektu,
  klipyTimeline,
  czasTrwaniaMs,
  czasAktualnyMs,
  segmentyCiszy,
  idAktywnegoSegmentuCiszy,
  idZaznaczonegoKlipuTimeline,
  uchwytWideoRef,
  formatujCzasTimeline,
  ustawieniaSiatkiTimeline = DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE,
  opcjeSiatkiTimeline = USTAWIENIA_DOCIAGANIA_TIMELINE_MVP,
  naZmianeCzasuTimeline,
  naZmianeUstawienSiatkiTimeline,
  naZaznaczKlipTimeline,
  naPrzetnijZaznaczonyKlip,
  naPrzesunZaznaczonyKlipWLewo,
  naPrzesunZaznaczonyKlipWPrawo,
  naSkrocPoczatekZaznaczonegoKlipu,
  naSkrocKoniecZaznaczonegoKlipu,
  naZmianePrzeciaganiaGlowicy,
  naWybranoSegmentCiszy
}: WlasciwosciPaneluOsiCzasu) {
  const uchwytTimelineRef = useRef<HTMLDivElement>(null);
  const [czyPrzeciaganieGlowicy, ustawCzyPrzeciaganieGlowicy] =
    useState(false);
  const aktywnySegmentCiszy = segmentyCiszy.find(
    (segmentCiszy) => segmentCiszy.id === idAktywnegoSegmentuCiszy
  );
  const zaznaczonyKlipTimeline = klipyTimeline.find(
    (klipTimeline) => klipTimeline.id === idZaznaczonegoKlipuTimeline
  );
  const czySaKlipyTimeline = klipyTimeline.length > 0;
  const czyCiecieDostepne = Boolean(
    zaznaczonyKlipTimeline && naPrzetnijZaznaczonyKlip
  );
  const czyEdycjaKlipuDostepna = Boolean(zaznaczonyKlipTimeline);

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

  function obsluzZmianeSiatkiTimeline(
    zdarzenie: ChangeEvent<HTMLSelectElement>
  ) {
    const wybraneUstawienia = opcjeSiatkiTimeline.find(
      (ustawieniaSiatki) =>
        ustawieniaSiatki.jednostka === zdarzenie.currentTarget.value
    );

    if (wybraneUstawienia) {
      naZmianeUstawienSiatkiTimeline?.(wybraneUstawienia);
    }
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
          <span>
            Dlugosc:{" "}
            {czySaKlipyTimeline
              ? formatujCzasTimeline(czasTrwaniaMs)
              : "brak klipow"}
          </span>
          <span>Aktualny czas: {formatujCzasTimeline(czasAktualnyMs)}</span>
        </div>
        <label className="panel-osi-czasu__siatka">
          <span>Siatka</span>
          <select
            value={ustawieniaSiatkiTimeline.jednostka}
            onChange={obsluzZmianeSiatkiTimeline}
          >
            {opcjeSiatkiTimeline.map((ustawieniaSiatki) => (
              <option
                key={ustawieniaSiatki.jednostka}
                value={ustawieniaSiatki.jednostka}
              >
                {opiszTrybSiatkiTimeline(ustawieniaSiatki)}
              </option>
            ))}
          </select>
        </label>
        <div className="panel-osi-czasu__narzedzia">
          <button
            type="button"
            disabled={
              !czyEdycjaKlipuDostepna || !naPrzesunZaznaczonyKlipWLewo
            }
            onClick={naPrzesunZaznaczonyKlipWLewo}
          >
            Przesun w lewo
          </button>
          <button
            type="button"
            disabled={
              !czyEdycjaKlipuDostepna || !naPrzesunZaznaczonyKlipWPrawo
            }
            onClick={naPrzesunZaznaczonyKlipWPrawo}
          >
            Przesun w prawo
          </button>
          <button
            type="button"
            disabled={
              !czyEdycjaKlipuDostepna || !naSkrocPoczatekZaznaczonegoKlipu
            }
            onClick={naSkrocPoczatekZaznaczonegoKlipu}
          >
            Skroc poczatek
          </button>
          <button
            type="button"
            disabled={
              !czyEdycjaKlipuDostepna || !naSkrocKoniecZaznaczonegoKlipu
            }
            onClick={naSkrocKoniecZaznaczonegoKlipu}
          >
            Skroc koniec
          </button>
          <button
            type="button"
            disabled={!czyCiecieDostepne}
            onClick={naPrzetnijZaznaczonyKlip}
          >
            Przetnij klip
          </button>
        </div>
      </div>

      <div className="panel-osi-czasu__tor">
        <div
          className="panel-osi-czasu__obszar"
          ref={uchwytTimelineRef}
          onMouseDown={obsluzKlikniecieTimeline}
        >
          {czySaKlipyTimeline ? (
            <div className="panel-osi-czasu__klipy">
              {klipyTimeline.map((klipTimeline) => (
                <Pasek_Klipu
                  key={klipTimeline.id}
                  klipTimeline={klipTimeline}
                  czasTrwaniaTimelineMs={czasTrwaniaMs}
                  czyZaznaczony={klipTimeline.id === idZaznaczonegoKlipuTimeline}
                  formatujCzas={formatujCzasTimeline}
                  naZaznacz={naZaznaczKlipTimeline}
                />
              ))}
            </div>
          ) : (
            <div className="panel-osi-czasu__pusty">
              Brak klipow na osi czasu.
            </div>
          )}
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
        <span>Siatka: {opiszTrybSiatkiTimeline(ustawieniaSiatkiTimeline)}</span>
        <span>
          Zaznaczony klip: {zaznaczonyKlipTimeline?.nazwa ?? "brak"}
        </span>
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
