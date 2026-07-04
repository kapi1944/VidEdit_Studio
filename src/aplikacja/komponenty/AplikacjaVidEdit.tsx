import type { ReactNode } from "react";
import {
  pobierzCzasTrwaniaMedium,
  utworzDaneKartyMedium
} from "../../domena/media/formatowanieKartyMedium";
import type { PlikMediow } from "../../domena/media/typyMediow";
import type { PodgladMedium } from "../../moduly/media/typyPodgladuMediow";
import { PodgladWideo } from "./PodgladWideo";
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

export type StatusZapisuProjektu =
  | "zapisano"
  | "niezapisane_zmiany"
  | "zapisywanie"
  | "blad_zapisu"
  | "roboczy";

type OpisStatusuZapisuProjektu = {
  etykieta: string;
  tytul: string;
};

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
  czyFilmDostepny: boolean;
};

type WlasciwosciPaneluWorkflow = DaneWorkflow;

type WlasciwosciObszaruRoboczego = {
  plikWideo?: PlikMediow;
  podgladWideo?: PodgladMedium;
  czasAktualnyMs: number;
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
  blad: "Błąd",
  placeholder: "Placeholder"
};

const opisyStatusuZapisuProjektu: Record<
  StatusZapisuProjektu,
  OpisStatusuZapisuProjektu
> = {
  zapisano: {
    etykieta: "zapisano",
    tytul: "Projekt zapisany."
  },
  niezapisane_zmiany: {
    etykieta: "niezapisane zmiany",
    tytul: "Projekt zawiera niezapisane zmiany."
  },
  zapisywanie: {
    etykieta: "zapisywanie...",
    tytul: "Trwa zapisywanie projektu."
  },
  blad_zapisu: {
    etykieta: "blad zapisu",
    tytul: "Nie udalo sie zapisac projektu."
  },
  roboczy: {
    etykieta: "projekt roboczy",
    tytul: "Projekt roboczy - zapis projektu zostanie dopracowany w kolejnym etapie."
  }
};

export function pobierzNazweProjektuDoPaska(nazwaProjektu?: string) {
  const nazwaPoPrzycieciu = nazwaProjektu?.trim();

  return nazwaPoPrzycieciu && nazwaPoPrzycieciu.length > 0
    ? nazwaPoPrzycieciu
    : "Projekt bez nazwy";
}

export function opiszStatusZapisuProjektu(
  statusZapisu: StatusZapisuProjektu
): OpisStatusuZapisuProjektu {
  return opisyStatusuZapisuProjektu[statusZapisu];
}

export function sprawdzCzyEksportJestDostepny(
  czyFilmDostepny: boolean,
  czyIstniejaZatwierdzoneCiecia: boolean
) {
  return czyFilmDostepny || czyIstniejaZatwierdzoneCiecia;
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
          Ponów
        </button>
        <label className="pasek-gorny-aplikacji__wybor">
          <span>Wygląd</span>
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
          Eksportuj
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
  czyFilmDostepny
}: WlasciwosciPaneluMediowProjektu) {
  return (
    <section
      className="panel-mediow-projektu"
      aria-labelledby="media-projektu-tytul"
    >
      <div className="panel-mediow-projektu__naglowek">
        <p className="etykieta-panelu">Media</p>
        <h2 id="media-projektu-tytul">Plik projektu</h2>
      </div>
      {dzieci}
      {!czyFilmDostepny ? (
        <p className="panel-mediow-projektu__pusty">
          Dodaj pierwszy film, aby rozpocząć czyszczenie nagrania.
        </p>
      ) : null}
    </section>
  );
}

export function ObszarRoboczy({
  plikWideo,
  podgladWideo,
  czasAktualnyMs,
  opisAktywnegoSegmentuCiszy,
  formatujCzasPodgladu,
  naZmianeCzasuOdtwarzania
}: WlasciwosciObszaruRoboczego) {
  const daneKartyWideo = plikWideo ? utworzDaneKartyMedium(plikWideo) : undefined;
  const czasTrwaniaWideoMs = plikWideo
    ? pobierzCzasTrwaniaMedium(plikWideo)
    : undefined;

  return (
    <section className="obszar-roboczy" aria-labelledby="obszar-roboczy-tytul">
      <div className="obszar-roboczy__naglowek">
        <p className="etykieta-panelu">Podglad</p>
        <h2 id="obszar-roboczy-tytul">Obszar roboczy</h2>
      </div>

      <div className="obszar-roboczy__podglad">
        {!plikWideo ? (
          <div className="obszar-roboczy__pusty">
            <strong>Zaimportuj film, aby rozpocząć.</strong>
            <span>
              VidEdit Studio pomoże wykryć ciszę, sprawdzić propozycje cięć i
              przygotować skróconą wersję nagrania.
            </span>
            <span>Import znajdziesz w lewym panelu.</span>
          </div>
        ) : null}

        {plikWideo && !podgladWideo ? (
          <div className="obszar-roboczy__pusty">
            <strong>Podgląd wideo nie jest jeszcze gotowy.</strong>
            <span>{plikWideo.nazwaPliku}</span>
          </div>
        ) : null}

        {plikWideo && podgladWideo && daneKartyWideo ? (
          <PodgladWideo
            objectUrl={podgladWideo.objectUrl}
            nazwaPliku={plikWideo.nazwaPliku}
            czasAktualnyMs={czasAktualnyMs}
            czasTrwaniaMs={czasTrwaniaWideoMs}
            rozdzielczosc={daneKartyWideo.rozdzielczosc}
            fps={daneKartyWideo.fps}
            audio={daneKartyWideo.audio}
            formatujCzasPodgladu={formatujCzasPodgladu}
            naZmianeCzasuOdtwarzania={naZmianeCzasuOdtwarzania}
          />
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
      <span className={`pasek-statusu__kropka pasek-statusu__kropka--${statusProjektuUi}`} />
      <span>{komunikat}</span>
    </footer>
  );
}
