import { useEffect, useRef, useState } from "react";
import { Panel_Osi_Czasu } from "../moduly/timeline/komponenty/Panel_Osi_Czasu";
import {
  Panel_Importu_Mediow,
  type StatusImportuMediow
} from "../moduly/media/komponenty/Panel_Importu_Mediow";
import { Lista_Mediow } from "../moduly/media/komponenty/Lista_Mediow";
import {
  Panel_Propozycji_Ciec,
  cofnijDecyzjePropozycjiCiecia,
  odrzucPropozycjeCiecia,
  uzupelnijBrakujacePropozycjeCiec,
  zatwierdzPropozycjeCiecia,
  zatwierdzWszystkiePropozycjeCiec
} from "../moduly/propozycje-ciec/indeksPropozycjiCiec";
import {
  OBSLUGIWANE_ROZSZERZENIA_WIDEO,
  walidujPlikMediow,
  zaimportujPlikMediow
} from "../moduly/media/indeksMediow";
import {
  dodajMediumDoProjektu,
  utworzPustyProjekt,
  zaktualizujMetadaneMediumWProjekcie,
  zaktualizujPropozycjeCiecWProjekcie
} from "../moduly/projekt/indeksProjektu";
import { formatujCzas } from "../domena/czas/formatowanieCzasu";
import type {
  PodgladMedium,
  PodgladyMediow
} from "../moduly/media/typyPodgladuMediow";
import { generujMiniatureWideoZPliku } from "../infrastruktura/media/generujMiniatureWideoBrowser";
import { odczytajMetadaneWideoZPliku } from "../infrastruktura/media/odczytajMetadaneWideoBrowser";
import { utworzDaneImportuZPlikuBrowserowego } from "../infrastruktura/media/utworzDaneImportuZPlikuBrowserowego";
import type { PropozycjaCiecia } from "../domena/timeline/typyTimeline";

type TrybWygladu = "jasny" | "ciemny" | "systemowy";

const kluczTrybuWygladu = "videdit-studio.tryb-wygladu";

function zwolnijObjectUrlPodgladu(podgladMedium: PodgladMedium) {
  URL.revokeObjectURL(podgladMedium.objectUrl);
}

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
  const [podgladyMediow, ustawPodgladyMediow] = useState<PodgladyMediow>({});
  const podgladyMediowRef = useRef<PodgladyMediow>({});

  useEffect(() => {
    document.documentElement.dataset.trybWygladu = trybWygladu;
    localStorage.setItem(kluczTrybuWygladu, trybWygladu);
  }, [trybWygladu]);

  useEffect(() => {
    podgladyMediowRef.current = podgladyMediow;
  }, [podgladyMediow]);

  useEffect(() => {
    return () => {
      Object.values(podgladyMediowRef.current).forEach(zwolnijObjectUrlPodgladu);
    };
  }, []);

  useEffect(() => {
    ustawProjekt((aktualnyProjekt) => {
      const segmentyCiszy =
        aktualnyProjekt.audio.segmentyCiszy.length > 0
          ? aktualnyProjekt.audio.segmentyCiszy
          : aktualnyProjekt.timeline.segmentyCiszy;

      if (segmentyCiszy.length === 0) {
        return aktualnyProjekt;
      }

      const propozycjeCiec = uzupelnijBrakujacePropozycjeCiec(
        segmentyCiszy,
        aktualnyProjekt.timeline.propozycjeCiec
      );

      return zaktualizujPropozycjeCiecWProjekcie(
        aktualnyProjekt,
        propozycjeCiec
      );
    });
  }, [projekt.audio.segmentyCiszy, projekt.timeline.segmentyCiszy]);

  const czasStartowy = formatujCzas(
    0,
    projekt.ustawienia.formatWyswietlaniaCzasu,
    projekt.ustawienia.liczbaKlatekNaSekunde
  );

  async function przygotujMiniatureMedium(idMedium: string, plik: File) {
    try {
      const miniaturaDataUrl = await generujMiniatureWideoZPliku(plik);

      ustawPodgladyMediow((aktualnePodglady) => {
        const podgladMedium = aktualnePodglady[idMedium];

        if (!podgladMedium) {
          return aktualnePodglady;
        }

        return {
          ...aktualnePodglady,
          [idMedium]: {
            ...podgladMedium,
            miniaturaDataUrl,
            statusMiniatury: "gotowe"
          }
        };
      });
    } catch {
      ustawPodgladyMediow((aktualnePodglady) => {
        const podgladMedium = aktualnePodglady[idMedium];

        if (!podgladMedium) {
          return aktualnePodglady;
        }

        return {
          ...aktualnePodglady,
          [idMedium]: {
            ...podgladMedium,
            statusMiniatury: "Miniatura niedostepna"
          }
        };
      });
    }
  }

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

    const idMedium = wynikImportu.dane.id;
    const objectUrlPodgladu = URL.createObjectURL(plik);
    const nowyPodgladMedium: PodgladMedium = {
      idMedium,
      objectUrl: objectUrlPodgladu,
      statusMiniatury: "Przygotowanie miniatury"
    };

    ustawProjekt((aktualnyProjekt) =>
      dodajMediumDoProjektu(aktualnyProjekt, wynikImportu.dane)
    );
    Object.values(podgladyMediowRef.current).forEach(zwolnijObjectUrlPodgladu);
    podgladyMediowRef.current = { [idMedium]: nowyPodgladMedium };
    ustawPodgladyMediow(podgladyMediowRef.current);
    ustawBladImportuMediow(undefined);
    ustawStatusImportuMediow("odczyt_metadanych");
    void przygotujMiniatureMedium(idMedium, plik);

    try {
      const metadane = await odczytajMetadaneWideoZPliku(plik);

      ustawProjekt((aktualnyProjekt) =>
        zaktualizujMetadaneMediumWProjekcie(
          aktualnyProjekt,
          idMedium,
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

  function zaktualizujPropozycjeCiec(
    zaktualizuj: (propozycjeCiec: PropozycjaCiecia[]) => PropozycjaCiecia[]
  ) {
    ustawProjekt((aktualnyProjekt) =>
      zaktualizujPropozycjeCiecWProjekcie(
        aktualnyProjekt,
        zaktualizuj(aktualnyProjekt.timeline.propozycjeCiec)
      )
    );
  }

  function obsluzZatwierdzeniePropozycjiCiecia(idPropozycjiCiecia: string) {
    zaktualizujPropozycjeCiec((propozycjeCiec) =>
      zatwierdzPropozycjeCiecia(propozycjeCiec, idPropozycjiCiecia)
    );
  }

  function obsluzOdrzuceniePropozycjiCiecia(idPropozycjiCiecia: string) {
    zaktualizujPropozycjeCiec((propozycjeCiec) =>
      odrzucPropozycjeCiecia(propozycjeCiec, idPropozycjiCiecia)
    );
  }

  function obsluzCofniecieDecyzjiPropozycjiCiecia(
    idPropozycjiCiecia: string
  ) {
    zaktualizujPropozycjeCiec((propozycjeCiec) =>
      cofnijDecyzjePropozycjiCiecia(propozycjeCiec, idPropozycjiCiecia)
    );
  }

  function obsluzZatwierdzenieWszystkichPropozycjiCiec() {
    zaktualizujPropozycjeCiec(zatwierdzWszystkiePropozycjeCiec);
  }

  function formatujCzasPropozycjiCiecia(czasMs: number) {
    return formatujCzas(
      czasMs,
      projekt.ustawienia.formatWyswietlaniaCzasu,
      projekt.ustawienia.liczbaKlatekNaSekunde
    );
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
        <Lista_Mediow media={projekt.media} podgladyMediow={podgladyMediow} />
      </section>

      <Panel_Osi_Czasu
        nazwaProjektu={projekt.nazwa}
        czasPoczatku={czasStartowy}
      />

      <Panel_Propozycji_Ciec
        propozycjeCiec={projekt.timeline.propozycjeCiec}
        formatujCzasCiecia={formatujCzasPropozycjiCiecia}
        naZatwierdz={obsluzZatwierdzeniePropozycjiCiecia}
        naOdrzuc={obsluzOdrzuceniePropozycjiCiecia}
        naCofnijDecyzje={obsluzCofniecieDecyzjiPropozycjiCiecia}
        naZatwierdzWszystkie={obsluzZatwierdzenieWszystkichPropozycjiCiec}
      />
    </main>
  );
}
