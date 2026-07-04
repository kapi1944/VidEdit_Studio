import type { ReactNode } from "react";
import type { PlikMediow } from "../../domena/media/typyMediow";
import type { PodgladMedium } from "../../moduly/media/typyPodgladuMediow";

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
  statusZapisu: StatusZapisuProjektu;
  trybWygladu: string;
  czyEksportDostepny: boolean;
  naZmianeTrybuWygladu: (trybWygladu: string) => void;
  naEksportuj: () => void;
};

type WlasciwosciKonteneraDzieci = {
  dzieci: ReactNode;
};

type WlasciwosciObszaruRoboczego = {
  plikWideo?: PlikMediow;
  podgladWideo?: PodgladMedium;
};

type WlasciwosciPaskaStatusu = {
  komunikat: string;
  statusZapisu: StatusZapisuProjektu;
};

const trybyPracy = ["Czyszczenie ciszy", "Transkrypcja", "Napisy", "Duble"];

const etykietyTrybuWygladu = {
  jasny: "Jasny",
  ciemny: "Ciemny",
  systemowy: "Systemowy"
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
    : "Nowy projekt";
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
  statusZapisu,
  trybWygladu,
  czyEksportDostepny,
  naZmianeTrybuWygladu,
  naEksportuj
}: WlasciwosciPaskaGornegoAplikacji) {
  const nazwaProjektuDoPaska = pobierzNazweProjektuDoPaska(nazwaProjektu);
  const opisStatusuZapisu = opiszStatusZapisuProjektu(statusZapisu);
  const komunikatCofania =
    "Cofanie operacji zostanie dodane w pozniejszym etapie.";
  const komunikatEksportu = czyEksportDostepny
    ? "Eksport filmu jest placeholderem tego etapu."
    : "Eksport bedzie dostepny po dodaniu filmu.";

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
          className={`znacznik-statusu znacznik-statusu--${statusZapisu}`}
          aria-label={`Status zapisu: ${opisStatusuZapisu.etykieta}`}
          title={opisStatusuZapisu.tytul}
        >
          {opisStatusuZapisu.etykieta}
        </span>
      </div>

      <div className="pasek-gorny-aplikacji__tryb">
        Tryb: {trybyPracy[0]}
      </div>

      <div className="pasek-gorny-aplikacji__akcje">
        <button type="button" disabled title={komunikatCofania}>
          Cofnij
        </button>
        <button type="button" disabled title={komunikatCofania}>
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
          title={komunikatEksportu}
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

export function PanelWorkflow() {
  return (
    <section className="panel-workflow" aria-labelledby="workflow-tytul">
      <p className="etykieta-panelu">Workflow MVP</p>
      <h2 id="workflow-tytul">Etapy pracy</h2>
      <ol className="lista-workflow">
        <li>
          <span className="znacznik-statusu znacznik-statusu--gotowe">
            Gotowe
          </span>
          Import jednego filmu
        </li>
        <li>
          <span className="znacznik-statusu znacznik-statusu--oczekuje">
            Oczekuje
          </span>
          Wykrycie ciszy
        </li>
        <li>
          <span className="znacznik-statusu znacznik-statusu--oczekuje">
            Oczekuje
          </span>
          Reczne decyzje
        </li>
        <li>
          <span className="znacznik-statusu znacznik-statusu--nieaktywne">
            Placeholder
          </span>
          Eksport filmu
        </li>
      </ol>
    </section>
  );
}

export function PanelMediowProjektu({ dzieci }: WlasciwosciKonteneraDzieci) {
  return (
    <section className="panel-mediow-projektu" aria-label="Media projektu">
      {dzieci}
    </section>
  );
}

export function ObszarRoboczy({
  plikWideo,
  podgladWideo
}: WlasciwosciObszaruRoboczego) {
  return (
    <section className="obszar-roboczy" aria-labelledby="obszar-roboczy-tytul">
      <div className="obszar-roboczy__naglowek">
        <p className="etykieta-panelu">Podglad</p>
        <h2 id="obszar-roboczy-tytul">Obszar roboczy</h2>
      </div>

      <div className="obszar-roboczy__podglad">
        {plikWideo && podgladWideo ? (
          <video
            controls
            src={podgladWideo.objectUrl}
            aria-label={`Podglad filmu ${plikWideo.nazwaPliku}`}
          />
        ) : (
          <div className="obszar-roboczy__pusty">
            <strong>Brak podgladu wideo</strong>
            <span>Zaimportuj jeden film, aby zobaczyc go w obszarze roboczym.</span>
          </div>
        )}
      </div>
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
  statusZapisu
}: WlasciwosciPaskaStatusu) {
  return (
    <footer className="pasek-statusu">
      <span className={`pasek-statusu__kropka pasek-statusu__kropka--${statusZapisu}`} />
      <span>{komunikat}</span>
    </footer>
  );
}
