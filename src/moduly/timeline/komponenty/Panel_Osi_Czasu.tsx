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
  MarkerTimeline,
  SciezkaTimeline,
  SegmentCiszy,
  StanEdycjiKlipuMysza,
  TrybEdycjiKlipuMysza,
  UstawieniaSiatkiTimeline
} from "../../../domena/timeline/typyTimeline";
import {
  DOMYSLNE_SCIEZKI_TIMELINE,
  DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE,
  opiszTrybSiatkiTimeline,
  pobierzSciezkaIdKlipuTimeline,
  pobierzSciezkiTimelineZFallbackiem,
  przeliczPrzesuniecieKlipuMysza,
  przeliczTrimLewejKrawedzi,
  przeliczTrimPrawejKrawedzi,
  rozpocznijPrzesuwanieKlipu,
  USTAWIENIA_DOCIAGANIA_TIMELINE_MVP
} from "../../../domena/timeline/typyTimeline";
import { przeliczPozycjeNaCzas } from "../przeliczCzasNaPozycje";
import { Pasek_Markerow } from "./Pasek_Markerow";
import { Pasek_Klipu } from "./Pasek_Klipu";
import { Segment_Ciszy_Na_Timeline } from "./Segment_Ciszy_Na_Timeline";
import { Znacznik_Czasu } from "./Znacznik_Czasu";

type WlasciwosciPaneluOsiCzasu = {
  nazwaProjektu: string;
  klipyTimeline: KlipTimeline[];
  sciezkiTimeline?: SciezkaTimeline[];
  markeryTimeline?: MarkerTimeline[];
  czasTrwaniaMs: number;
  czasAktualnyMs: number;
  segmentyCiszy: SegmentCiszy[];
  idAktywnegoSegmentuCiszy?: string;
  idZaznaczonegoKlipuTimeline?: string;
  uchwytWideoRef: RefObject<HTMLVideoElement | null>;
  formatujCzasTimeline: (czasMs: number) => string;
  fpsTimeline?: number;
  ustawieniaSiatkiTimeline?: UstawieniaSiatkiTimeline;
  opcjeSiatkiTimeline?: UstawieniaSiatkiTimeline[];
  czyPokazacZaawansowaneUstawienia?: boolean;
  naZmianeCzasuTimeline: (czasMs: number) => void;
  naZmianeUstawienSiatkiTimeline?: (
    ustawieniaSiatki: UstawieniaSiatkiTimeline
  ) => void;
  naDodajMarkerTimeline?: () => void;
  naUsunMarkerTimeline?: (idMarkera: string) => void;
  naZaznaczKlipTimeline?: (idKlipu: string) => void;
  naZmienKlipTimeline?: (klipTimeline: KlipTimeline) => void;
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
  sciezkiTimeline = DOMYSLNE_SCIEZKI_TIMELINE,
  markeryTimeline = [],
  czasTrwaniaMs,
  czasAktualnyMs,
  segmentyCiszy,
  idAktywnegoSegmentuCiszy,
  idZaznaczonegoKlipuTimeline,
  uchwytWideoRef,
  formatujCzasTimeline,
  fpsTimeline,
  ustawieniaSiatkiTimeline = DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE,
  opcjeSiatkiTimeline = USTAWIENIA_DOCIAGANIA_TIMELINE_MVP,
  czyPokazacZaawansowaneUstawienia = true,
  naZmianeCzasuTimeline,
  naZmianeUstawienSiatkiTimeline,
  naDodajMarkerTimeline,
  naUsunMarkerTimeline = () => undefined,
  naZaznaczKlipTimeline,
  naZmienKlipTimeline,
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
  const [edycjaKlipuMysza, ustawEdycjaKlipuMysza] = useState<
    (StanEdycjiKlipuMysza & { trybEdycji: TrybEdycjiKlipuMysza }) | undefined
  >();
  const aktywnySegmentCiszy = segmentyCiszy.find(
    (segmentCiszy) => segmentCiszy.id === idAktywnegoSegmentuCiszy
  );
  const zaznaczonyKlipTimeline = klipyTimeline.find(
    (klipTimeline) => klipTimeline.id === idZaznaczonegoKlipuTimeline
  );
  const uporzadkowaneSciezkiTimeline = [
    ...pobierzSciezkiTimelineZFallbackiem(sciezkiTimeline)
  ].sort((pierwszaSciezka, drugaSciezka) => {
    if (pierwszaSciezka.kolejnosc !== drugaSciezka.kolejnosc) {
      return pierwszaSciezka.kolejnosc - drugaSciezka.kolejnosc;
    }

    return pierwszaSciezka.id.localeCompare(drugaSciezka.id);
  });
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

  function rozpocznijEdycjeKlipuMysza(
    klipTimeline: KlipTimeline,
    trybEdycji: TrybEdycjiKlipuMysza,
    pozycjaMyszyX: number,
    szerokoscTimelinePx: number
  ) {
    if (czasTrwaniaMs <= 0 || szerokoscTimelinePx <= 0) {
      return;
    }

    ustawEdycjaKlipuMysza({
      ...rozpocznijPrzesuwanieKlipu(
        klipTimeline,
        pozycjaMyszyX,
        szerokoscTimelinePx,
        czasTrwaniaMs
      ),
      trybEdycji
    });
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

  useEffect(() => {
    if (!edycjaKlipuMysza || !naZmienKlipTimeline) {
      return;
    }

    const zmienKlipTimeline = naZmienKlipTimeline;

    function obsluzRuchMyszy(zdarzenie: MouseEvent) {
      if (!edycjaKlipuMysza) {
        return;
      }

      const klipPoEdycji =
        edycjaKlipuMysza.trybEdycji === "trim-lewy"
          ? przeliczTrimLewejKrawedzi(
              edycjaKlipuMysza,
              zdarzenie.clientX,
              ustawieniaSiatkiTimeline,
              fpsTimeline
            )
          : edycjaKlipuMysza.trybEdycji === "trim-prawy"
            ? przeliczTrimPrawejKrawedzi(
                edycjaKlipuMysza,
                zdarzenie.clientX,
                ustawieniaSiatkiTimeline,
                fpsTimeline
              )
            : przeliczPrzesuniecieKlipuMysza(
                edycjaKlipuMysza,
                zdarzenie.clientX,
                ustawieniaSiatkiTimeline,
                fpsTimeline
              );

      zmienKlipTimeline(klipPoEdycji);
    }

    function zakonczEdycjeKlipuMysza() {
      ustawEdycjaKlipuMysza(undefined);
    }

    document.addEventListener("mousemove", obsluzRuchMyszy);
    document.addEventListener("mouseup", zakonczEdycjeKlipuMysza);

    return () => {
      document.removeEventListener("mousemove", obsluzRuchMyszy);
      document.removeEventListener("mouseup", zakonczEdycjeKlipuMysza);
    };
  }, [
    edycjaKlipuMysza,
    fpsTimeline,
    naZmienKlipTimeline,
    ustawieniaSiatkiTimeline
  ]);

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
        {czyPokazacZaawansowaneUstawienia ? (
          <>
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
                disabled={!naDodajMarkerTimeline || czasTrwaniaMs <= 0}
                onClick={naDodajMarkerTimeline}
              >
                Dodaj marker
              </button>
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
                title="Przetnij w playheadzie (S)"
              >
                Przetnij w playheadzie
              </button>
            </div>
          </>
        ) : null}
      </div>

      <div className="panel-osi-czasu__tor">
        <div className="panel-osi-czasu__gutter-sciezek" aria-hidden="true">
          <div className="panel-osi-czasu__gutter-markerow" />
          <div className="panel-osi-czasu__etykiety-sciezek">
            {uporzadkowaneSciezkiTimeline.map((sciezkaTimeline) => (
              <div
                key={sciezkaTimeline.id}
                className={`panel-osi-czasu__etykieta-sciezki panel-osi-czasu__etykieta-sciezki--${sciezkaTimeline.rodzaj}`}
              >
                {sciezkaTimeline.nazwa}
              </div>
            ))}
          </div>
        </div>
        <div
          className="panel-osi-czasu__obszar"
          ref={uchwytTimelineRef}
        >
          <div
            className="panel-osi-czasu__pasek-markerow"
            onMouseDown={obsluzKlikniecieTimeline}
            aria-label="Pasek markerow timeline"
          >
            <Pasek_Markerow
              markeryTimeline={markeryTimeline}
              czasTrwaniaTimelineMs={czasTrwaniaMs}
              formatujCzas={formatujCzasTimeline}
              naUsunMarker={naUsunMarkerTimeline}
            />
          </div>
          <div className="panel-osi-czasu__klipy">
            {uporzadkowaneSciezkiTimeline.map((sciezkaTimeline) => {
              const klipySciezki = klipyTimeline.filter(
                (klipTimeline) =>
                  pobierzSciezkaIdKlipuTimeline(klipTimeline) ===
                  sciezkaTimeline.id
              );

              return (
                <div
                  key={sciezkaTimeline.id}
                  className={`panel-osi-czasu__sciezka panel-osi-czasu__sciezka--${sciezkaTimeline.rodzaj}`}
                >
                  <div className="panel-osi-czasu__klipy-sciezki">
                    {klipySciezki.map((klipTimeline) => (
                      <Pasek_Klipu
                        key={klipTimeline.id}
                        klipTimeline={klipTimeline}
                        czasTrwaniaTimelineMs={czasTrwaniaMs}
                        czyZaznaczony={
                          klipTimeline.id === idZaznaczonegoKlipuTimeline
                        }
                        formatujCzas={formatujCzasTimeline}
                        naZaznacz={naZaznaczKlipTimeline}
                        naRozpocznijEdycjeMysza={rozpocznijEdycjeKlipuMysza}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {!czySaKlipyTimeline ? (
            <div className="panel-osi-czasu__pusty">
              Brak klipow na osi czasu.
            </div>
          ) : null}
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
        <span>Markery: {markeryTimeline.length}</span>
        <span>Sciezki: {uporzadkowaneSciezkiTimeline.length}</span>
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
