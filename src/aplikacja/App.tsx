import { useEffect, useState } from "react";
import { Panel_Osi_Czasu } from "../moduly/timeline/komponenty/Panel_Osi_Czasu";
import {
  Panel_Importu_Mediow,
  type StatusImportuMediow
} from "../moduly/media/komponenty/Panel_Importu_Mediow";
import { Lista_Mediow } from "../moduly/media/komponenty/Lista_Mediow";
import {
  OBSLUGIWANE_ROZSZERZENIA_WIDEO,
  walidujPlikMediow,
  zaimportujPlikMediow
} from "../moduly/media/indeksMediow";
import {
  dodajMediumDoProjektu,
  utworzPustyProjekt,
  zaktualizujMetadaneMediumWProjekcie
} from "../moduly/projekt/indeksProjektu";
import { formatujCzas } from "../domena/czas/formatowanieCzasu";
import { odczytajMetadaneWideoZPliku } from "../infrastruktura/media/odczytajMetadaneWideoBrowser";
import { utworzDaneImportuZPlikuBrowserowego } from "../infrastruktura/media/utworzDaneImportuZPlikuBrowserowego";

type TrybWygladu = "jasny" | "ciemny" | "systemowy";

const kluczTrybuWygladu = "videdit-studio.tryb-wygladu";

function sprawdzCzyTrybWygladuJestPoprawny(
  trybWygladu: string | null
): trybWygladu is TrybWygladu {
  return (
    trybWygladu === "jasny" ||
    trybWygladu === "ciemny" ||
    trybWygladu === "systemowy"
  );
}

function pobierzPoczatkowyTrybWygladu(): TrybWygladu {
  const zapisanyTrybWygladu = localStorage.getItem(kluczTrybuWygladu);

  if (sprawdzCzyTrybWygladuJestPoprawny(zapisanyTrybWygladu)) {
    return zapisanyTrybWygladu;
  }

  return "systemowy";
}

export function Aplikacja() {
  const [projekt, ustawProjekt] = useState(() =>
    utworzPustyProjekt("Projekt bez nazwy")
  );
  const [bladImportuMediow, ustawBladImportuMediow] = useState<string>();
  const [statusImportuMediow, ustawStatusImportuMediow] =
    useState<StatusImportuMediow>("bezczynny");
  const [trybWygladu, ustawTrybWygladu] = useState(pobierzPoczatkowyTrybWygladu);

  useEffect(() => {
    document.documentElement.dataset.trybWygladu = trybWygladu;
    localStorage.setItem(kluczTrybuWygladu, trybWygladu);
  }, [trybWygladu]);

  const czasStartowy = formatujCzas(
    0,
    projekt.ustawienia.formatWyswietlaniaCzasu,
    projekt.ustawienia.liczbaKlatekNaSekunde
  );

  async function obsluzWybraniePliku(plik: File) {
    ustawStatusImportuMediow("wybieranie");
    const bledyWalidacji = walidujPlikMediow(plik);

    if (bledyWalidacji.length > 0) {
      ustawBladImportuMediow(
        bledyWalidacji[0]?.komunikat ?? "Nie udało się zaimportować pliku."
      );
      return;
    }

    const daneImportu = utworzDaneImportuZPlikuBrowserowego(plik);
    const wynikImportu = zaimportujPlikMediow(daneImportu);

    if (!wynikImportu.czySukces) {
      ustawBladImportuMediow(
        wynikImportu.bledy[0]?.komunikat ??
          "Nie udało się zaimportować pliku."
      );
      return;
    }

    ustawProjekt((aktualnyProjekt) =>
      dodajMediumDoProjektu(aktualnyProjekt, wynikImportu.dane)
    );
    ustawBladImportuMediow(undefined);
    ustawStatusImportuMediow("odczyt_metadanych");

    try {
      const metadane = await odczytajMetadaneWideoZPliku(plik);

      ustawProjekt((aktualnyProjekt) =>
        zaktualizujMetadaneMediumWProjekcie(
          aktualnyProjekt,
          wynikImportu.dane.id,
          metadane
        )
      );
      ustawStatusImportuMediow("gotowe");
    } catch {
      ustawBladImportuMediow(
        "Zaimportowano, ale nie udało się odczytać metadanych."
      );
      ustawStatusImportuMediow("blad");
    }
  }

  return (
    <main className="ekran-startowy">
      <section className="naglowek-aplikacji">
        <div className="naglowek-aplikacji__gora">
          <div>
            <p className="etykieta-wersji">Wersja webowa</p>
            <h1>VidEdit Studio</h1>
            <p className="opis-aplikacji">
              Prosty edytor do szybkiego czyszczenia nagrań mówionych.
            </p>
          </div>

          <label className="przelacznik-wygladu">
            <span>Tryb wyglądu</span>
            <select
              value={trybWygladu}
              onChange={(zdarzenie) =>
                ustawTrybWygladu(zdarzenie.currentTarget.value as TrybWygladu)
              }
            >
              <option value="jasny">Jasny</option>
              <option value="ciemny">Ciemny</option>
              <option value="systemowy">Systemowy</option>
            </select>
          </label>
        </div>
      </section>

      <section className="sekcja-aplikacji" aria-labelledby="nastepne-moduly">
        <h2 id="nastepne-moduly">Następne moduły</h2>
        <ul className="lista-modulow">
          <li>Analiza techniczna pliku wideo</li>
          <li>Wykrywanie ciszy i propozycje cięć</li>
          <li>Ręczne zatwierdzanie zmian</li>
          <li>Eksport przyciętego filmu</li>
        </ul>
      </section>

      <Panel_Importu_Mediow
        rozszerzeniaWideo={OBSLUGIWANE_ROZSZERZENIA_WIDEO}
        bladImportuMediow={bladImportuMediow}
        statusImportuMediow={statusImportuMediow}
        naWybranoPlik={obsluzWybraniePliku}
      />

      <section className="sekcja-aplikacji" aria-labelledby="projekt-montazu">
        <h2 id="projekt-montazu">Projekt: {projekt.nazwa}</h2>
        <Lista_Mediow media={projekt.media} />
      </section>

      <Panel_Osi_Czasu
        nazwaProjektu={projekt.nazwa}
        czasPoczatku={czasStartowy}
      />
    </main>
  );
}
