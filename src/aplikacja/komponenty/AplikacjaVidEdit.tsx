import {
  useRef,
  type CSSProperties,
  type PointerEvent as ZdarzenieWskaznika,
  type ReactNode,
  type RefObject
} from "react";
import {
  pobierzCzasTrwaniaMedium,
  utworzDaneKartyMedium
} from "../../domena/media/formatowanieKartyMedium";
import type { PlikMediow } from "../../domena/media/typyMediow";
import type { KlipTimeline } from "../../domena/timeline/typyTimeline";
import type { PodgladyMediow } from "../../moduly/media/typyPodgladuMediow";
import {
  etykietyMotywuInterfejsu,
  etykietyTrybuInterfejsu,
  type MotywInterfejsu,
  type RozmiaryLayoutu,
  type TrybInterfejsu
} from "../ustawieniaInterfejsu";
import {
  etykietyTrybuPodgladu,
  type TrybPodgladu
} from "../trybyPodgladu";
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
  rozmiaryLayoutu: RozmiaryLayoutu;
  pasekGorny: ReactNode;
  panelLewy: ReactNode;
  obszarRoboczy: ReactNode;
  panelPrawy?: ReactNode;
  timeline: ReactNode;
  pasekStatusu: ReactNode;
  naZmianeRozmiarowLayoutu: (rozmiaryLayoutu: Partial<RozmiaryLayoutu>) => void;
};

type WlasciwosciPaskaGornegoAplikacji = {
  nazwaProjektu?: string;
  statusProjektuUi: StatusProjektuUi;
  trybWygladu: string;
  motywInterfejsu: MotywInterfejsu;
  trybInterfejsu?: TrybInterfejsu;
  liczbaMediow: number;
  czyPokazacZaawansowaneParametryEksportu?: boolean;
  naZmianeTrybuWygladu: (trybWygladu: string) => void;
  naZmianeMotywuInterfejsu: (motywInterfejsu: string) => void;
  naZmianeTrybuInterfejsu?: (trybInterfejsu: TrybInterfejsu) => void;
  naResetUkladu?: () => void;
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
  trybPodgladu: TrybPodgladu;
  idAktywnegoMediumBiblioteki?: string;
  czasAktualnyMs: number;
  uchwytWideoRef: RefObject<HTMLVideoElement | null>;
  czyPrzeciaganieGlowicy: boolean;
  opisAktywnegoSegmentuCiszy?: string;
  formatujCzasPodgladu: (czasMs: number) => string;
  naZmianeTrybuPodgladu: (trybPodgladu: TrybPodgladu) => void;
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

const zadaniaSzybkichAkcjiLite = [
  "Wykryj cisze",
  "Wygeneruj napisy",
  "Dodaj znak wodny",
  "Popraw obraz",
  "Wycisz audio"
];

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
  rozmiaryLayoutu,
  pasekGorny,
  panelLewy,
  obszarRoboczy,
  panelPrawy,
  timeline,
  pasekStatusu,
  naZmianeRozmiarowLayoutu
}: WlasciwosciAplikacjiVidEdit) {
  const klasyAplikacji = [
    "aplikacja-videdit",
    panelPrawy ? undefined : "aplikacja-videdit--bez-panelu-prawego"
  ]
    .filter(Boolean)
    .join(" ");
  const styleLayoutu = {
    "--szerokosc-panelu-lewego": `${rozmiaryLayoutu.szerokoscPaneluLewegoPx}px`,
    "--szerokosc-panelu-prawego": `${rozmiaryLayoutu.szerokoscPaneluPrawegoPx}px`,
    "--wysokosc-timeline": `${rozmiaryLayoutu.wysokoscTimelinePx}px`
  } as CSSProperties;

  function rozpocznijPrzeciaganieRozmiaru(
    zdarzenie: ZdarzenieWskaznika<HTMLButtonElement>,
    obsluzRuch: (przesuniecieX: number, przesuniecieY: number) => void
  ) {
    const startX = zdarzenie.clientX;
    const startY = zdarzenie.clientY;

    zdarzenie.preventDefault();

    function obsluzRuchWskaznika(zdarzenieRuchu: PointerEvent) {
      obsluzRuch(
        zdarzenieRuchu.clientX - startX,
        zdarzenieRuchu.clientY - startY
      );
    }

    function zakonczPrzeciaganie() {
      document.removeEventListener("pointermove", obsluzRuchWskaznika);
      document.removeEventListener("pointerup", zakonczPrzeciaganie);
      document.removeEventListener("pointercancel", zakonczPrzeciaganie);
      document.body.classList.remove("aplikacja-videdit--zmiana-rozmiaru");
    }

    document.body.classList.add("aplikacja-videdit--zmiana-rozmiaru");
    document.addEventListener("pointermove", obsluzRuchWskaznika);
    document.addEventListener("pointerup", zakonczPrzeciaganie);
    document.addEventListener("pointercancel", zakonczPrzeciaganie);
  }

  function rozpocznijZmianePaneluLewego(
    zdarzenie: ZdarzenieWskaznika<HTMLButtonElement>
  ) {
    const poczatkowaSzerokosc = rozmiaryLayoutu.szerokoscPaneluLewegoPx;

    rozpocznijPrzeciaganieRozmiaru(zdarzenie, (przesuniecieX) => {
      naZmianeRozmiarowLayoutu({
        szerokoscPaneluLewegoPx: poczatkowaSzerokosc + przesuniecieX
      });
    });
  }

  function rozpocznijZmianePaneluPrawego(
    zdarzenie: ZdarzenieWskaznika<HTMLButtonElement>
  ) {
    const poczatkowaSzerokosc = rozmiaryLayoutu.szerokoscPaneluPrawegoPx;

    rozpocznijPrzeciaganieRozmiaru(zdarzenie, (przesuniecieX) => {
      naZmianeRozmiarowLayoutu({
        szerokoscPaneluPrawegoPx: poczatkowaSzerokosc - przesuniecieX
      });
    });
  }

  function rozpocznijZmianeTimeline(
    zdarzenie: ZdarzenieWskaznika<HTMLButtonElement>
  ) {
    const poczatkowaWysokosc = rozmiaryLayoutu.wysokoscTimelinePx;

    rozpocznijPrzeciaganieRozmiaru(zdarzenie, (_przesuniecieX, przesuniecieY) => {
      naZmianeRozmiarowLayoutu({
        wysokoscTimelinePx: poczatkowaWysokosc - przesuniecieY
      });
    });
  }

  return (
    <main className={klasyAplikacji} style={styleLayoutu}>
      {pasekGorny}
      <div className="aplikacja-videdit__srodek">
        {panelLewy}
        <button
          type="button"
          className="uchwyt-zmiany-rozmiaru uchwyt-zmiany-rozmiaru--pionowy"
          aria-label="Zmien szerokosc lewego panelu"
          onPointerDown={rozpocznijZmianePaneluLewego}
        />
        {obszarRoboczy}
        {panelPrawy ? (
          <button
            type="button"
            className="uchwyt-zmiany-rozmiaru uchwyt-zmiany-rozmiaru--pionowy"
            aria-label="Zmien szerokosc prawego panelu"
            onPointerDown={rozpocznijZmianePaneluPrawego}
          />
        ) : null}
        {panelPrawy}
      </div>
      <button
        type="button"
        className="uchwyt-zmiany-rozmiaru uchwyt-zmiany-rozmiaru--poziomy"
        aria-label="Zmien wysokosc timeline"
        onPointerDown={rozpocznijZmianeTimeline}
      />
      {timeline}
      {pasekStatusu}
    </main>
  );
}

export function PasekGornyAplikacji({
  nazwaProjektu,
  statusProjektuUi,
  trybWygladu,
  motywInterfejsu,
  trybInterfejsu = "pro",
  liczbaMediow,
  czyPokazacZaawansowaneParametryEksportu = true,
  naZmianeTrybuWygladu,
  naZmianeMotywuInterfejsu,
  naZmianeTrybuInterfejsu,
  naResetUkladu,
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
        <div
          className="pasek-gorny-aplikacji__przelacznik-interfejsu"
          aria-label="Tryb interfejsu"
        >
          {(Object.keys(etykietyTrybuInterfejsu) as TrybInterfejsu[]).map(
            (tryb) => (
              <button
                type="button"
                className={
                  tryb === trybInterfejsu
                    ? "pasek-gorny-aplikacji__tryb-interfejsu-aktywny"
                    : undefined
                }
                aria-pressed={tryb === trybInterfejsu}
                onClick={() => naZmianeTrybuInterfejsu?.(tryb)}
                key={tryb}
              >
                {etykietyTrybuInterfejsu[tryb]}
              </button>
            )
          )}
        </div>
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
        <button type="button" onClick={naResetUkladu}>
          Reset ukladu
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
        <label className="pasek-gorny-aplikacji__wybor">
          <span>Motyw</span>
          <select
            value={motywInterfejsu}
            onChange={(zdarzenie) =>
              naZmianeMotywuInterfejsu(zdarzenie.currentTarget.value)
            }
          >
            {Object.entries(etykietyMotywuInterfejsu).map(
              ([wartosc, etykieta]) => (
                <option key={wartosc} value={wartosc}>
                  {etykieta}
                </option>
              )
            )}
          </select>
        </label>
        {czyPokazacZaawansowaneParametryEksportu ? (
          <button
            type="button"
            className="pasek-gorny-aplikacji__eksport"
            disabled={!czyEksportDostepny}
            title={tytulPlaceholderaEksportu}
            onClick={naEksportuj}
          >
            {etykietaEksportu}
          </button>
        ) : null}
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

export function PanelSzybkichAkcjiLite() {
  return (
    <section className="panel-szybkich-akcji-lite" aria-labelledby="lite-tytul">
      <p className="etykieta-panelu">Tryb LITE</p>
      <h2 id="lite-tytul">Szybkie akcje</h2>
      <div className="panel-szybkich-akcji-lite__lista">
        {zadaniaSzybkichAkcjiLite.map((zadanie) => (
          <button type="button" disabled key={zadanie}>
            {zadanie}
          </button>
        ))}
      </div>
    </section>
  );
}

export function ObszarRoboczy({
  media,
  klipyTimeline,
  podgladyMediow,
  trybPodgladu,
  idAktywnegoMediumBiblioteki,
  czasAktualnyMs,
  uchwytWideoRef,
  czyPrzeciaganieGlowicy,
  opisAktywnegoSegmentuCiszy,
  formatujCzasPodgladu,
  naZmianeTrybuPodgladu,
  naZmianeCzasuOdtwarzania
}: WlasciwosciObszaruRoboczego) {
  const uchwytPodgladuKlipuRef = useRef<HTMLVideoElement>(null);
  const aktywnyKlip = znajdzAktywnyKlipTimeline(klipyTimeline, czasAktualnyMs);
  const aktywneMedium = znajdzMediumDlaKlipu(media, aktywnyKlip);
  const aktywneMediumBiblioteki = media.find(
    (medium) => medium.id === idAktywnegoMediumBiblioteki
  );
  const podgladAktywnegoMedium = pobierzPodgladDlaMedium(
    podgladyMediow,
    aktywneMedium
  );
  const podgladAktywnegoMediumBiblioteki = pobierzPodgladDlaMedium(
    podgladyMediow,
    aktywneMediumBiblioteki
  );
  const daneKartyMedium = aktywneMedium
    ? utworzDaneKartyMedium(aktywneMedium)
    : undefined;
  const daneKartyMediumBiblioteki = aktywneMediumBiblioteki
    ? utworzDaneKartyMedium(aktywneMediumBiblioteki)
    : undefined;
  const czasTrwaniaPodgladuMs = aktywnyKlip?.czasTrwaniaMs
    ? aktywnyKlip.czasTrwaniaMs
    : aktywneMedium
      ? pobierzCzasTrwaniaMedium(aktywneMedium)
      : undefined;
  const czasTrwaniaMediumBibliotekiMs = aktywneMediumBiblioteki
    ? pobierzCzasTrwaniaMedium(aktywneMediumBiblioteki)
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

  function wyrenderujPustyStanKlipu() {
    return (
      <div className="obszar-roboczy__pusty">
        <strong>Wybierz medium z biblioteki, aby zobaczyc podglad klipu.</strong>
      </div>
    );
  }

  function wyrenderujPodgladKlipuBiblioteki() {
    if (!aktywneMediumBiblioteki) {
      return wyrenderujPustyStanKlipu();
    }

    if (!podgladAktywnegoMediumBiblioteki) {
      return (
        <div className="obszar-roboczy__pusty">
          <strong>Podglad medium nie jest jeszcze gotowy.</strong>
          <span>{aktywneMediumBiblioteki.nazwaPliku}</span>
        </div>
      );
    }

    if (aktywneMediumBiblioteki.typ === "grafika") {
      return (
        <div className="podglad-grafiki">
          <div className="podglad-grafiki__naglowek">
            <span className="podglad-wideo__etykieta">Klip z biblioteki</span>
            <p className="podglad-grafiki__nazwa">
              {aktywneMediumBiblioteki.nazwaPliku}
            </p>
          </div>
          <div className="podglad-grafiki__ramka">
            <img
              src={podgladAktywnegoMediumBiblioteki.objectUrl}
              alt={`Podglad grafiki ${aktywneMediumBiblioteki.nazwaPliku}`}
            />
          </div>
        </div>
      );
    }

    if (!daneKartyMediumBiblioteki) {
      return wyrenderujPustyStanKlipu();
    }

    return (
      <PodgladWideo
        objectUrl={podgladAktywnegoMediumBiblioteki.objectUrl}
        nazwaPliku={aktywneMediumBiblioteki.nazwaPliku}
        etykietaAktywnegoKlipu="Klip z biblioteki"
        czasAktualnyMs={0}
        czasTrwaniaMs={czasTrwaniaMediumBibliotekiMs}
        uchwytWideoRef={uchwytPodgladuKlipuRef}
        czyPrzeciaganieGlowicy={false}
        rozdzielczosc={daneKartyMediumBiblioteki.rozdzielczosc}
        fps={daneKartyMediumBiblioteki.fps}
        audio={daneKartyMediumBiblioteki.audio}
        formatujCzasPodgladu={formatujCzasPodgladu}
        naZmianeCzasuOdtwarzania={() => undefined}
      />
    );
  }

  function wyrenderujPodgladTimeline() {
    return (
      <>
        {!czySaMedia ? (
          <div className="obszar-roboczy__pusty">
            <strong>Zaimportuj media, aby rozpoczac montaz.</strong>
            <span>
              Mozesz dodac kilka plikow wideo lub grafik, a potem ulozyc je na
              osi czasu.
            </span>
          </div>
        ) : null}

        {czySaMedia && !czySaKlipyTimeline ? (
          <div className="obszar-roboczy__pusty">
            <strong>Dodaj media na os czasu.</strong>
            <span>
              Media sa w bibliotece projektu. Timeline pozostaje pusty, dopoki
              nie ma klipow.
            </span>
          </div>
        ) : null}

        {czySaKlipyTimeline && aktywnyKlip && !aktywneMedium ? (
          <div className="obszar-roboczy__pusty">
            <strong>Klip nie ma dostepnego pliku zrodlowego.</strong>
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
            <strong>Podglad aktywnego klipu nie jest jeszcze gotowy.</strong>
            <span>{aktywnyKlip.nazwa}</span>
            <span>Zrodlo: {aktywneMedium.nazwaPliku}</span>
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
            etykietaAktywnegoKlipu="Podglad aktywnego klipu"
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
      </>
    );
  }

  return (
    <section className="obszar-roboczy" aria-labelledby="obszar-roboczy-tytul">
      <div className="obszar-roboczy__naglowek">
        <div>
          <p className="etykieta-panelu">Podglad</p>
          <h2 id="obszar-roboczy-tytul">Obszar roboczy</h2>
        </div>
        <div className="obszar-roboczy__tryby" aria-label="Tryb podgladu">
          {(Object.keys(etykietyTrybuPodgladu) as TrybPodgladu[]).map(
            (tryb) => (
              <button
                key={tryb}
                type="button"
                aria-pressed={tryb === trybPodgladu}
                onClick={() => naZmianeTrybuPodgladu(tryb)}
              >
                {etykietyTrybuPodgladu[tryb]}
              </button>
            )
          )}
        </div>
      </div>

      <div className="obszar-roboczy__podglad">
        {trybPodgladu === "klip" ? wyrenderujPodgladKlipuBiblioteki() : null}
        {trybPodgladu === "timeline" ? wyrenderujPodgladTimeline() : null}
        {trybPodgladu === "dzielony" ? (
          <div className="obszar-roboczy__podglad-dzielony">
            <div className="obszar-roboczy__panel-podgladu">
              <h3>Klip z biblioteki</h3>
              {wyrenderujPodgladKlipuBiblioteki()}
            </div>
            <div className="obszar-roboczy__panel-podgladu">
              <h3>Timeline projektu</h3>
              {wyrenderujPodgladTimeline()}
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
