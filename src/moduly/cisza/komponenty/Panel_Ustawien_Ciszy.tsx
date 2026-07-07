import { useState } from "react";

import {
  BladLokalnegoMostu,
  pobierzStatusFfmpegZLokalnegoMostu,
  type StatusFfmpegLokalnegoMostu
} from "../../../infrastruktura/lokalny-most/klientLokalnegoMostu";
import {
  ZAKRESY_USTAWIEN_WYKRYWANIA_CISZY,
  listaPresetowWykrywaniaCiszy,
  pobierzPresetWykrywaniaCiszy,
  walidujUstawieniaWykrywaniaCiszy
} from "../indeksCiszy";
import type {
  PresetWykrywaniaCiszy,
  UstawieniaWykrywaniaCiszy
} from "../indeksCiszy";

type PoleUstawienCiszy = keyof UstawieniaWykrywaniaCiszy;
type StatusSprawdzaniaLokalnegoMostu = "bezczynny" | "sprawdzanie" | "gotowe" | "blad";

type WlasciwosciPaneluUstawienCiszy = {
  ustawienia: UstawieniaWykrywaniaCiszy;
  naZmianeUstawien: (ustawienia: UstawieniaWykrywaniaCiszy) => void;
};

const polaUstawienCiszy: Array<{
  pole: PoleUstawienCiszy;
  etykieta: string;
  opis: string;
}> = [
  {
    pole: "progCiszyDb",
    etykieta: "Prog ciszy",
    opis: "Nizsza wartosc wymaga cichszego fragmentu."
  },
  {
    pole: "minimalnaDlugoscCiszyMs",
    etykieta: "Minimalna dlugosc",
    opis: "Krotsze pauzy zostana pominiete."
  },
  {
    pole: "marginesPrzedMs",
    etykieta: "Margines przed",
    opis: "Czas zostawiany przed wykryta cisza."
  },
  {
    pole: "marginesPoMs",
    etykieta: "Margines po",
    opis: "Czas zostawiany po wykrytej ciszy."
  },
  {
    pole: "minimalnaPrzerwaMiedzySegmentamiMs",
    etykieta: "Przerwa miedzy segmentami",
    opis: "Bliskie pauzy moga zostac potraktowane jako jeden fragment."
  }
];

function czyUstawieniaSaTakieSame(
  pierwsze: UstawieniaWykrywaniaCiszy,
  drugie: UstawieniaWykrywaniaCiszy
) {
  return polaUstawienCiszy.every(
    ({ pole }) => pierwsze[pole] === drugie[pole]
  );
}

function pobierzAktywnyPreset(
  ustawienia: UstawieniaWykrywaniaCiszy
): PresetWykrywaniaCiszy | "wlasny" {
  const preset = listaPresetowWykrywaniaCiszy.find((pozycjaPresetu) =>
    czyUstawieniaSaTakieSame(ustawienia, pozycjaPresetu.ustawienia)
  );

  return preset?.id ?? "wlasny";
}

function pobierzOpisZakresu(pole: PoleUstawienCiszy) {
  const zakres = ZAKRESY_USTAWIEN_WYKRYWANIA_CISZY[pole];

  return `${zakres.minimum} - ${zakres.maksimum} ${zakres.jednostka}`;
}

function pobierzKomunikatBledu(
  bledy: ReturnType<typeof walidujUstawieniaWykrywaniaCiszy>,
  pole: PoleUstawienCiszy
) {
  return bledy.find((blad) => blad.pole === pole)?.komunikat;
}

function pobierzKomunikatyStatusuFfmpeg(status: StatusFfmpegLokalnegoMostu) {
  return [
    status.czyFfmpegDostepny ? "FFmpeg dostepny" : "FFmpeg niedostepny",
    status.czyFfprobeDostepny ? "FFprobe dostepny" : "FFprobe niedostepny",
    ...(status.blad ? [`Blad: ${status.blad}`] : [])
  ];
}

function pobierzKomunikatBleduMostu(blad: unknown) {
  if (blad instanceof BladLokalnegoMostu || blad instanceof Error) {
    return blad.message;
  }

  return "Nie udalo sie sprawdzic lokalnego mostu FFmpeg.";
}

export function Panel_Ustawien_Ciszy({
  ustawienia,
  naZmianeUstawien
}: WlasciwosciPaneluUstawienCiszy) {
  const [statusSprawdzaniaMostu, ustawStatusSprawdzaniaMostu] =
    useState<StatusSprawdzaniaLokalnegoMostu>("bezczynny");
  const [statusFfmpegMostu, ustawStatusFfmpegMostu] =
    useState<StatusFfmpegLokalnegoMostu>();
  const [bladMostu, ustawBladMostu] = useState<string>();
  const aktywnyPreset = pobierzAktywnyPreset(ustawienia);
  const aktywneDanePresetu = listaPresetowWykrywaniaCiszy.find(
    (preset) => preset.id === aktywnyPreset
  );
  const bledyWalidacji = walidujUstawieniaWykrywaniaCiszy(ustawienia);

  function obsluzZmianePresetu(wartosc: string) {
    if (wartosc === "wlasny") {
      return;
    }

    naZmianeUstawien(
      pobierzPresetWykrywaniaCiszy(wartosc as PresetWykrywaniaCiszy)
    );
  }

  function obsluzZmianePola(pole: PoleUstawienCiszy, wartosc: string) {
    const wartoscLiczbowa = Number(wartosc);

    naZmianeUstawien({
      ...ustawienia,
      [pole]: wartoscLiczbowa
    });
  }

  async function obsluzSprawdzenieFfmpeg() {
    ustawStatusSprawdzaniaMostu("sprawdzanie");
    ustawBladMostu(undefined);

    try {
      const status = await pobierzStatusFfmpegZLokalnegoMostu();

      ustawStatusFfmpegMostu(status);
      ustawStatusSprawdzaniaMostu("gotowe");
    } catch (blad) {
      ustawStatusFfmpegMostu(undefined);
      ustawBladMostu(pobierzKomunikatBleduMostu(blad));
      ustawStatusSprawdzaniaMostu("blad");
    }
  }

  return (
    <section
      className="panel-ustawien-ciszy"
      aria-labelledby="ustawienia-ciszy-tytul"
    >
      <div className="panel-ustawien-ciszy__naglowek">
        <p className="panel-ustawien-ciszy__etykieta">Wykrywanie</p>
        <h2 id="ustawienia-ciszy-tytul">Ustawienia ciszy</h2>
      </div>

      <label className="panel-ustawien-ciszy__wybor">
        <span>Preset</span>
        <select
          value={aktywnyPreset}
          onChange={(zdarzenie) =>
            obsluzZmianePresetu(zdarzenie.currentTarget.value)
          }
        >
          {listaPresetowWykrywaniaCiszy.map((preset) => (
            <option value={preset.id} key={preset.id}>
              {preset.etykieta}
            </option>
          ))}
          <option value="wlasny">Wlasny</option>
        </select>
      </label>

      <p className="panel-ustawien-ciszy__opis">
        {aktywneDanePresetu?.opis ?? "Wlasne ustawienia wykrywania ciszy."}{" "}
        Zmiana ustawien nie uruchamia analizy automatycznie. Parametry zostana
        uzyte dopiero po kliknieciu "Wykryj cisze".
      </p>

      <div className="panel-ustawien-ciszy__diagnostyka" aria-live="polite">
        <button
          className="panel-ustawien-ciszy__przycisk-diagnostyki"
          type="button"
          onClick={obsluzSprawdzenieFfmpeg}
          disabled={statusSprawdzaniaMostu === "sprawdzanie"}
        >
          Sprawdz FFmpeg
        </button>

        {statusSprawdzaniaMostu === "sprawdzanie" ? (
          <p className="panel-ustawien-ciszy__status-mostu">Sprawdzanie FFmpeg...</p>
        ) : null}

        {statusSprawdzaniaMostu === "gotowe" && statusFfmpegMostu ? (
          <ul className="panel-ustawien-ciszy__statusy-mostu">
            {pobierzKomunikatyStatusuFfmpeg(statusFfmpegMostu).map(
              (komunikat) => (
                <li key={komunikat}>{komunikat}</li>
              )
            )}
          </ul>
        ) : null}

        {statusSprawdzaniaMostu === "blad" ? (
          <div className="panel-ustawien-ciszy__status-mostu" role="alert">
            <p>Most niedostepny</p>
            {bladMostu ? <p>Blad: {bladMostu}</p> : null}
          </div>
        ) : null}
      </div>

      <div className="panel-ustawien-ciszy__pola">
        {polaUstawienCiszy.map(({ pole, etykieta, opis }) => {
          const zakres = ZAKRESY_USTAWIEN_WYKRYWANIA_CISZY[pole];
          const komunikatBledu = pobierzKomunikatBledu(bledyWalidacji, pole);

          return (
            <label className="panel-ustawien-ciszy__pole" key={pole}>
              <span className="panel-ustawien-ciszy__nazwa">{etykieta}</span>
              <input
                type="number"
                value={ustawienia[pole]}
                min={zakres.minimum}
                max={zakres.maksimum}
                step={pole === "progCiszyDb" ? 1 : 10}
                onChange={(zdarzenie) =>
                  obsluzZmianePola(pole, zdarzenie.currentTarget.value)
                }
                aria-invalid={komunikatBledu ? true : undefined}
              />
              <span className="panel-ustawien-ciszy__zakres">
                Zakres: {pobierzOpisZakresu(pole)}
              </span>
              <span className="panel-ustawien-ciszy__opis-pola">{opis}</span>
              {komunikatBledu ? (
                <span className="panel-ustawien-ciszy__blad">
                  {komunikatBledu}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </section>
  );
}
