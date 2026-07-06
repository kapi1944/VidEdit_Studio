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

export function Panel_Ustawien_Ciszy({
  ustawienia,
  naZmianeUstawien
}: WlasciwosciPaneluUstawienCiszy) {
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
