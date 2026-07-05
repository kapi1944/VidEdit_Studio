import type { ReactNode, RefObject } from "react";
import {
  pobierzCzasTrwaniaMedium,
  utworzDaneKartyMedium
} from "../../domena/media/formatowanieKartyMedium";
import type { PlikMediow } from "../../domena/media/typyMediow";
import type { KlipTimeline } from "../../domena/timeline/typyTimeline";
import type { PodgladyMediow } from "../../moduly/media/typyPodgladuMediow";
import { PodgladWideo } from "./PodgladWideo";
import {
  obliczCzasPodgladuKlipu,
  pobierzPodgladDlaMedium,
  znajdzAktywnyKlipTimeline,
  znajdzMediumDlaKlipu
} from "./pomocnicyObszaruRoboczego";
import {
  utworzKrokiWorkflow,
  type DaneWorkflow,
  type StatusKrokuWorkflow
} from "./pomocnicyWorkflow";
import {
  czyEksportDostepnyWUi,
  czyHistoriaDostepnaWUi,
  pobierzEtykieteStatusuProjektuUi,
  tytulPlaceholderaEksportu,
  tytulPlaceholderaHistorii,
  type StatusProjektuUi
} from "./pomocnicyPaskaGornego";

type WlasciwosciAplikacjiVidEdit = {
  pasekGorny: ReactNode;
  panelLewy: ReactNode;
  obszarRoboczy: ReactNode;
  panelPrawy: ReactNode;
  timeline: ReactNode;
  pasekStatusu: ReactNode;
};

type WlasciwosciPaskaGornegoAplikacji = {
  nazwaProjektu?: string;
  statusProjektuUi: StatusProjektuUi;
  trybWygladu: string;
  liczbaMediow: number;
  naZmianeTrybuWygladu: (trybWygladu: string) => void;
  naEksportuj?: () => void;
};

type WlasciwosciKonteneraDzieci = {
  dzieci: ReactNode;
};

type WlasciwosciPaneluMediowProjektu = WlasciwosciKonteneraDzieci & {
  czyMediaDostepne: boolean;
};

type WlasciwosciPaneluWorkflow = DaneWorkflow;

type WlasciwosciObszaruRoboczego = {
  media: PlikMediow[];
  klipyTimeline: KlipTimeline[];
  podgladyMediow: PodgladyMediow;
  czasAktualnyMs: number;
  uchwytWideoRef: RefObject<HTMLVideoElement | null>;
  czyPrzeciaganieGlowicy: boolean;
  opisAktywnegoSegmentuCiszy?: string;
  formatujCzasPodgladu: (czasMs: number) => string;
  naZmianeCzasuOdtwarzania: (czasMs: number) => void;
};

type WlasciwosciPaskaStatusu = {
  komunikat: string;
  statusProjektuUi: StatusProjektuUi;
};

const aktywnyTrybPracy = "Czyszczenie ciszy";

const etykietyTrybuWygladu = {
  jasny: "Jasny",
  ciemny: "Ciemny",
  systemowy: "Systemowy"
};

const etykietyStatusuWorkflow: Record<StatusKrokuWorkflow, string> = {
  gotowe: "Gotowe",
  aktywny: "Aktywny",
  oczekuje: "Oczekuje",
  blad: "Blad",
  placeholder: "Placeholder"
};

export function pobierzNazweProjektuDoPaska(nazwaProjektu?: string) {
  const nazwaPoPrzycieciu = nazwaProjektu?.trim();

  return nazwaPoPrzycieciu && nazwaPoPrzycieciu.length > 0
    ? nazwaPoPrzycieciu
    : "Projekt bez nazwy";
}

export function AplikacjaVidEdit({
  pasekGorny,
  panelLewy,
  obszarRoboczy,
  panelPrawy,
  timeline,
  pasekStatusu
}: WlasciwosciAplikacjiVidEdit) {
  return (
    <main className="aplikacja-videdit">
      {pasekGorny}
      <div className="aplikacja-videdit__srodek">
        {panelLewy}
        {obszarRoboczy}
        {panelPrawy}
      </div>
      {timeline}
      {pasekStatusu}
    </main>
  );
}

export function PasekGornyAplikacji({
  nazwaProjektu,
  statusProjektuUi,
  trybWygladu,
  liczbaMediow,
  naZmianeTrybuWygladu,
  naEksportuj
}: WlasciwosciPaskaGornegoAplikacji) {
  const nazwaProjektuDoPaska = pobierzNazweProjektuDoPaska(nazwaProjektu);
  const etykietaStatusuProjektu =
    pobierzEtykieteStatusuProjektuUi(statusProjektuUi);
  const czyHistoriaDostepna = czyHistoriaDostepnaWUi();
  const czyEksportDostepny = czyEksportDostepnyWUi({ liczbaMediow });
  const etykietaEksportu = czyEksportDostepny
    ? "Eksportuj"
    : "Eksport niedostepny";

  return (
    <header className="pasek-gorny-aplikacji">
      <div className="pasek-gorny-aplikacji__marka">
        <strong>VidEdit Studio</strong>
      </div>

      <div className="pasek-gorny-aplikacji__projekt">
        <span className="pasek-gorny-aplikacji__nazwa-projektu">
          {nazwaProjektuDoPaska}
        </span>
        <span
          className={`znacznik-statusu znacznik-statusu--${statusProjektuUi}`}
          aria-label={`Status projektu: ${etykietaStatusuProjektu}`}
          title={etykietaStatusuProjektu}
        >
          {etykietaStatusuProjektu}
        </span>
      </div>

      <div className="pasek-gorny-aplikacji__tryb">
        Tryb: {aktywnyTrybPracy}
      </div>

      <div className="pasek-gorny-aplikacji__akcje">
        <button
          type="button"
          disabled={!czyHistoriaDostepna}
          title={tytulPlaceholderaHistorii}
        >
          Cofnij
        </button>
        <button
          type="button"
          disabled={!czyHistoriaDostepna}
          title={tytulPlaceholderaHistorii}
        >
          Ponow
        </button>
        <label className="pasek-gorny-aplikacji__wybor">
          <span>Wyglad</span>
          <select
            value={trybWygladu}
            onChange={(zdarzenie) =>
              naZmianeTrybuWygladu(zdarzenie.currentTarget.value)
            }
          >
            {Object.entries(etykietyTrybuWygladu).map(([wartosc, etykieta]) => (
              <option key={wartosc} value={wartosc}>
                {etykieta}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="pasek-gorny-aplikacji__eksport"
          disabled={!czyEksportDostepny}
          title={tytulPlaceholderaEksportu}
          onClick={naEksportuj}
        >
          {etykietaEksportu}
        </button>
      </div>
    </header>
  );
}

export function PanelBocznyLewy({ dzieci }: WlasciwosciKonteneraDzieci) {
  return <aside className="panel-boczny-lewy">{dzieci}</aside>;
}

export function PanelWorkflow(wlasciwosci: WlasciwosciPaneluWorkflow) {
  const krokiWorkflow = utworzKrokiWorkflow(wlasciwosci);

  return (
    <section className="panel-workflow" aria-labelledby="workflow-tytul">
      <p className="etykieta-panelu">Workflow MVP</p>
      <h2 id="workflow-tytul">Etapy pracy</h2>
      <ol className="lista-workflow">
        {krokiWorkflow.map((krokWorkflow) => (
          <li
            className={`lista-workflow__krok lista-workflow__krok--${krokWorkflow.status}`}
            key={krokWorkflow.id}
            aria-current={
              krokWorkflow.status === "aktywny" ? "step" : undefined
            }
          >
            <span
              className={`znacznik-statusu znacznik-statusu--${krokWorkflow.status}`}
            >
              {etykietyStatusuWorkflow[krokWorkflow.status]}
            </span>
            <span className="lista-workflow__tresc">
              <span className="lista-workflow__nazwa">
                {krokWorkflow.nazwa}
              </span>
              <span className="lista-workflow__opis">{krokWorkflow.opis}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PanelMediowProjektu({
  dzieci,
  czyMediaDostepne
}: WlasciwosciPaneluMediowProjektu) {
  return (
    <section
      className="panel-mediow-projektu"
      aria-labelledby="media-projektu-tytul"
    >
      <div className="panel-mediow-projektu__naglowek">
        <p className="etykieta-panelu">Media</p>
        <h2 id="media-projektu-tytul">Media projektu</h2>
      </div>
      {dzieci}
      {!czyMediaDostepne ? (
        <p className="panel-mediow-projektu__pusty">
          Dodaj media, aby rozpoczac montaz.
        </p>
      ) : null}
    </section>
  );
}

export function ObszarRoboczy({
  media,
  klipyTimeline,
  podgladyMediow,
  czasAktualnyMs,
  uchwytWideoRef,
  czyPrzeciaganieGlowicy,
  opisAktywnegoSegmentuCiszy,
  formatujCzasPodgladu,
  naZmianeCzasuOdtwarzania
}: WlasciwosciObszaruRoboczego) {
  const aktywnyKlip = znajdzAktywnyKlipTimeline(klipyTimeline, czasAktualnyMs);
  const aktywneMedium = znajdzMediumDlaKlipu(media, aktywnyKlip);
  const podgladAktywnegoMedium = pobierzPodgladDlaMedium(
    podgladyMediow,
    aktywneMedium
  );
  const daneKartyMedium = aktywneMedium
    ? utworzDaneKartyMedium(aktywneMedium)
    : undefined;
  const czasTrwaniaPodgladuMs = aktywnyKlip?.czasTrwaniaMs
    ? aktywnyKlip.czasTrwaniaMs
    : aktywneMedium
      ? pobierzCzasTrwaniaMedium(aktywneMedium)
      : undefined;
  const czasPodgladuMs = aktywnyKlip
    ? obliczCzasPodgladuKlipu(aktywnyKlip, czasAktualnyMs)
    : czasAktualnyMs;
  const czySaMedia = media.length > 0;
  const czySaKlipyTimeline = klipyTimeline.length > 0;
  const czyAktywneWideo = aktywnyKlip?.rodzaj === "wideo";
  const czyAktywnaGrafika = aktywnyKlip?.rodzaj === "grafika";
  const tekstCzasuKlipu = aktywnyKlip
    ? formatujCzasPodgladu(aktywnyKlip.czasTrwaniaMs)
    : undefined;

  return (
    <section className="obszar-roboczy" aria-labelledby="obszar-roboczy-tytul">
      <div className="obszar-roboczy__naglowek">
        <p className="etykieta-panelu">Podglad</p>
        <h2 id="obszar-roboczy-tytul">Obszar roboczy</h2>
      </div>

      <div className="obszar-roboczy__podglad">
        {!czySaMedia ? (
          <div className="obszar-roboczy__pusty">
            <strong>Zaimportuj media, aby rozpocząć montaż.</strong>
            <span>
              Możesz dodać kilka plików wideo lub grafik, a potem ułożyć je na osi czasu.
            </span>
          </div>
        ) : null}

        {czySaMedia && !czySaKlipyTimeline ? (
          <div className="obszar-roboczy__pusty">
            <strong>Dodaj media na oś czasu.</strong>
            <span>
              Media sa w bibliotece projektu. Timeline pozostaje pusty, dopoki
              nie ma klipow.
            </span>
          </div>
        ) : null}

        {czySaKlipyTimeline && aktywnyKlip && !aktywneMedium ? (
          <div className="obszar-roboczy__pusty">
            <strong>Klip nie ma dostępnego pliku źródłowego.</strong>
            <span>{aktywnyKlip.nazwa}</span>
          </div>
        ) : null}

        {czySaKlipyTimeline && !aktywnyKlip ? (
          <div className="obszar-roboczy__pusty">
            <strong>Brak aktywnego klipu w tym miejscu osi czasu.</strong>
            <span>Przesun glowice na klip, aby zobaczyc podglad.</span>
          </div>
        ) : null}

        {czySaKlipyTimeline &&
        aktywnyKlip &&
        aktywneMedium &&
        !podgladAktywnegoMedium ? (
          <div className="obszar-roboczy__pusty">
            <strong>Podgląd aktywnego klipu nie jest jeszcze gotowy.</strong>
            <span>{aktywnyKlip.nazwa}</span>
            <span>Źródło: {aktywneMedium.nazwaPliku}</span>
          </div>
        ) : null}

        {czyAktywneWideo &&
        aktywnyKlip &&
        aktywneMedium &&
        podgladAktywnegoMedium &&
        daneKartyMedium ? (
          <PodgladWideo
            objectUrl={podgladAktywnegoMedium.objectUrl}
            nazwaKlipu={aktywnyKlip.nazwa}
            nazwaPliku={aktywneMedium.nazwaPliku}
            etykietaAktywnegoKlipu="Podgląd aktywnego klipu"
            czasAktualnyMs={czasPodgladuMs}
            czasTrwaniaMs={czasTrwaniaPodgladuMs}
            uchwytWideoRef={uchwytWideoRef}
            czyPrzeciaganieGlowicy={czyPrzeciaganieGlowicy}
            rozdzielczosc={daneKartyMedium.rozdzielczosc}
            fps={daneKartyMedium.fps}
            audio={daneKartyMedium.audio}
            formatujCzasPodgladu={formatujCzasPodgladu}
            naZmianeCzasuOdtwarzania={naZmianeCzasuOdtwarzania}
          />
        ) : null}

        {czyAktywnaGrafika &&
        aktywnyKlip &&
        aktywneMedium &&
        podgladAktywnegoMedium ? (
          <div className="podglad-grafiki">
            <div className="podglad-grafiki__naglowek">
              <span className="podglad-wideo__etykieta">
                Grafika na timeline
              </span>
              <p className="podglad-grafiki__nazwa">{aktywnyKlip.nazwa}</p>
              <p className="podglad-grafiki__zrodlo">
                Zrodlo: {aktywneMedium.nazwaPliku}
              </p>
              {tekstCzasuKlipu ? (
                <p className="podglad-grafiki__czas">
                  Czas trwania klipu: {tekstCzasuKlipu}
                </p>
              ) : null}
            </div>
            <div className="podglad-grafiki__ramka">
              <img
                src={podgladAktywnegoMedium.objectUrl}
                alt={`Podglad grafiki ${aktywneMedium.nazwaPliku}`}
              />
            </div>
          </div>
        ) : null}
      </div>

      {opisAktywnegoSegmentuCiszy ? (
        <p className="obszar-roboczy__kontekst">
          Aktywny segment ciszy: {opisAktywnegoSegmentuCiszy}
        </p>
      ) : null}
    </section>
  );
}

export function PanelBocznyPrawy({ dzieci }: WlasciwosciKonteneraDzieci) {
  return <aside className="panel-boczny-prawy">{dzieci}</aside>;
}

export function TimelineMontazu({ dzieci }: WlasciwosciKonteneraDzieci) {
  return (
    <section className="timeline-montazu" aria-label="Timeline montazu">
      {dzieci}
    </section>
  );
}

export function PasekStatusu({
  komunikat,
  statusProjektuUi
}: WlasciwosciPaskaStatusu) {
  return (
    <footer className="pasek-statusu">
      <span
        className={`pasek-statusu__kropka pasek-statusu__kropka--${statusProjektuUi}`}
      />
      <span>{komunikat}</span>
    </footer>
  );
}
