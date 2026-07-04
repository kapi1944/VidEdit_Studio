import { useEffect, useRef, useState } from "react";
import {
  AplikacjaVidEdit,
  ObszarRoboczy,
  PanelBocznyLewy,
  PanelBocznyPrawy,
  PanelMediowProjektu,
  PanelWorkflow,
  PasekGornyAplikacji,
  PasekStatusu,
  TimelineMontazu,
  sprawdzCzyEksportJestDostepny,
  type StatusZapisuProjektu
} from "./komponenty/AplikacjaVidEdit";
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
import type {
  PropozycjaCiecia,
  SegmentCiszy
} from "../domena/timeline/typyTimeline";

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

  return "ciemny";
}

export function Aplikacja() {
  const [projekt, ustawProjekt] = useState(() =>
    utworzPustyProjekt("Nowy projekt")
  );
  const [bladImportuMediow, ustawBladImportuMediow] = useState<string>();
  const [statusImportuMediow, ustawStatusImportuMediow] =
    useState<StatusImportuMediow>("bezczynny");
  const [trybWygladu, ustawTrybWygladu] = useState(pobierzPoczatkowyTrybWygladu);
  const [podgladyMediow, ustawPodgladyMediow] = useState<PodgladyMediow>({});
  const [komunikatEksportu, ustawKomunikatEksportu] = useState<string>();
  const [idAktywnegoSegmentuCiszy, ustawIdAktywnegoSegmentuCiszy] =
    useState<string>();
  const [aktualnyCzasTimelineMs, ustawAktualnyCzasTimelineMs] = useState(0);
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

  const segmentyCiszyTimeline =
    projekt.audio.segmentyCiszy.length > 0
      ? projekt.audio.segmentyCiszy
      : projekt.timeline.segmentyCiszy;
  const pierwszyPlikWideo = projekt.media.find(
    (medium) => medium.typ === "wideo"
  );
  const czasTrwaniaFilmuMs =
    pierwszyPlikWideo?.metadane?.czasTrwaniaMs ??
    pierwszyPlikWideo?.czasTrwaniaMs ??
    0;
  const czasAktualnyWZakresieMs =
    czasTrwaniaFilmuMs > 0
      ? Math.min(aktualnyCzasTimelineMs, czasTrwaniaFilmuMs)
      : 0;
  const idAktywnegoSegmentuCiszyTimeline = segmentyCiszyTimeline.some(
    (segmentCiszy) => segmentCiszy.id === idAktywnegoSegmentuCiszy
  )
    ? idAktywnegoSegmentuCiszy
    : undefined;

  function formatujCzasNaTimeline(czasMs: number) {
    return formatujCzas(
      czasMs,
      projekt.ustawienia.formatWyswietlaniaCzasu,
      projekt.ustawienia.liczbaKlatekNaSekunde
    );
  }

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
        bledyWalidacji[0]?.komunikat ?? "Nie udalo sie zaimportowac pliku."
      );
      return;
    }

    const daneImportu = utworzDaneImportuZPlikuBrowserowego(plik);
    const wynikImportu = zaimportujPlikMediow(daneImportu);

    if (!wynikImportu.czySukces) {
      ustawBladImportuMediow(
        wynikImportu.bledy[0]?.komunikat ?? "Nie udalo sie zaimportowac pliku."
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
        "Zaimportowano, ale nie udalo sie odczytac metadanych."
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

  function obsluzWybranieSegmentuCiszy(segmentCiszy: SegmentCiszy) {
    ustawIdAktywnegoSegmentuCiszy(segmentCiszy.id);
    ustawAktualnyCzasTimelineMs(segmentCiszy.czasPoczatkuMs);
  }

  function obsluzEksport() {
    ustawKomunikatEksportu(
      "Eksport filmu zostanie dopracowany w kolejnym etapie MVP."
    );
  }

  function obsluzZmianeTrybuWygladu(nowyTrybWygladu: string) {
    if (sprawdzCzyTrybWygladuJestPoprawny(nowyTrybWygladu)) {
      ustawTrybWygladu(nowyTrybWygladu);
    }
  }

  const statusZapisu: StatusZapisuProjektu = "roboczy";
  const czyIstniejaZatwierdzoneCiecia = projekt.timeline.propozycjeCiec.some(
    (propozycjaCiecia) => propozycjaCiecia.status === "zatwierdzona"
  );
  const czyEksportDostepny = sprawdzCzyEksportJestDostepny(
    Boolean(pierwszyPlikWideo),
    czyIstniejaZatwierdzoneCiecia
  );
  const podgladPierwszegoPlikuWideo = pierwszyPlikWideo
    ? podgladyMediow[pierwszyPlikWideo.id]
    : undefined;
  const komunikatPaskaStatusu =
    komunikatEksportu ??
    bladImportuMediow ??
    `Media: ${projekt.media.length} | Segmenty ciszy: ${segmentyCiszyTimeline.length} | Propozycje ciec: ${projekt.timeline.propozycjeCiec.length}`;

  return (
    <AplikacjaVidEdit
      pasekGorny={
        <PasekGornyAplikacji
          nazwaProjektu={projekt.nazwa}
          statusZapisu={statusZapisu}
          trybWygladu={trybWygladu}
          czyEksportDostepny={czyEksportDostepny}
          naZmianeTrybuWygladu={obsluzZmianeTrybuWygladu}
          naEksportuj={obsluzEksport}
        />
      }
      panelLewy={
        <PanelBocznyLewy
          dzieci={
            <>
              <PanelWorkflow />
              <PanelMediowProjektu
                dzieci={
                  <>
                    <Panel_Importu_Mediow
                      rozszerzeniaWideo={OBSLUGIWANE_ROZSZERZENIA_WIDEO}
                      bladImportuMediow={bladImportuMediow}
                      statusImportuMediow={statusImportuMediow}
                      naWybranoPlik={obsluzWybraniePliku}
                    />
                    <Lista_Mediow
                      media={projekt.media}
                      podgladyMediow={podgladyMediow}
                    />
                  </>
                }
              />
            </>
          }
        />
      }
      obszarRoboczy={
        <ObszarRoboczy
          plikWideo={pierwszyPlikWideo}
          podgladWideo={podgladPierwszegoPlikuWideo}
        />
      }
      panelPrawy={
        <PanelBocznyPrawy
          dzieci={
            <Panel_Propozycji_Ciec
              propozycjeCiec={projekt.timeline.propozycjeCiec}
              formatujCzasCiecia={formatujCzasNaTimeline}
              naZatwierdz={obsluzZatwierdzeniePropozycjiCiecia}
              naOdrzuc={obsluzOdrzuceniePropozycjiCiecia}
              naCofnijDecyzje={obsluzCofniecieDecyzjiPropozycjiCiecia}
              naZatwierdzWszystkie={obsluzZatwierdzenieWszystkichPropozycjiCiec}
            />
          }
        />
      }
      timeline={
        <TimelineMontazu
          dzieci={
            <Panel_Osi_Czasu
              nazwaProjektu={projekt.nazwa}
              czasTrwaniaMs={czasTrwaniaFilmuMs}
              czasAktualnyMs={czasAktualnyWZakresieMs}
              segmentyCiszy={segmentyCiszyTimeline}
              idAktywnegoSegmentuCiszy={idAktywnegoSegmentuCiszyTimeline}
              formatujCzasTimeline={formatujCzasNaTimeline}
              naWybranoSegmentCiszy={obsluzWybranieSegmentuCiszy}
            />
          }
        />
      }
      pasekStatusu={
        <PasekStatusu
          komunikat={komunikatPaskaStatusu}
          statusZapisu={statusZapisu}
        />
      }
    />
  );
}
