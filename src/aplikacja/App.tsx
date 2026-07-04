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
  TimelineMontazu
} from "./komponenty/AplikacjaVidEdit";
import {
  okreslStatusProjektuUi,
  pobierzEtykieteStatusuProjektuUi
} from "./komponenty/pomocnicyPaskaGornego";
import { Panel_Osi_Czasu } from "../moduly/timeline/komponenty/Panel_Osi_Czasu";
import { ograniczCzasDoZakresu } from "../moduly/timeline/przeliczCzasNaPozycje";
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
import { dodajLubZaktualizujPodgladMedium } from "../moduly/media/typyPodgladuMediow";
import { generujMiniatureWideoZPliku } from "../infrastruktura/media/generujMiniatureWideoBrowser";
import { odczytajMetadaneWideoZPliku } from "../infrastruktura/media/odczytajMetadaneWideoBrowser";
import { utworzDaneImportuZPlikuBrowserowego } from "../infrastruktura/media/utworzDaneImportuZPlikuBrowserowego";
import type {
  PropozycjaCiecia,
  SegmentCiszy
} from "../domena/timeline/typyTimeline";
import { obliczCzasKoncaKlipu } from "../domena/timeline/typyTimeline";

type TrybWygladu = "jasny" | "ciemny" | "systemowy";

const kluczTrybuWygladu = "videdit-studio.tryb-wygladu";
const minimalnyCzasTechnicznyTimelineMs = 10_000;

function obliczKoniecZakresowTimeline(
  zakresyTimeline: Array<Pick<SegmentCiszy | PropozycjaCiecia, "czasKoncaMs">>
) {
  return zakresyTimeline.reduce(
    (najdluzszyCzasMs, zakresTimeline) =>
      Math.max(najdluzszyCzasMs, zakresTimeline.czasKoncaMs),
    0
  );
}

function zwolnijObjectUrlPodgladu(podgladMedium?: PodgladMedium) {
  if (!podgladMedium?.objectUrl) {
    return;
  }

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
  const [idAktywnegoSegmentuCiszy, ustawIdAktywnegoSegmentuCiszy] =
    useState<string>();
  const [aktualnyCzasTimelineMs, ustawAktualnyCzasTimelineMs] = useState(0);
  const [czyPrzeciaganieGlowicy, ustawCzyPrzeciaganieGlowicy] =
    useState(false);
  const uchwytWideoRef = useRef<HTMLVideoElement>(null);
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
  const klipyTimeline = projekt.timeline.klipy ?? [];
  const czasTrwaniaKlipowTimelineMs = klipyTimeline.reduce(
    (najdluzszyCzasMs, klipTimeline) =>
      Math.max(najdluzszyCzasMs, obliczCzasKoncaKlipu(klipTimeline)),
    0
  );
  const czasTrwaniaDanychTimelineMs = Math.max(
    obliczKoniecZakresowTimeline(segmentyCiszyTimeline),
    obliczKoniecZakresowTimeline(projekt.timeline.propozycjeCiec)
  );
  const czasTechnicznyTimelineMs =
    czasTrwaniaKlipowTimelineMs > 0
      ? czasTrwaniaKlipowTimelineMs
      : Math.max(minimalnyCzasTechnicznyTimelineMs, czasTrwaniaDanychTimelineMs);
  const czasAktualnyWZakresieMs =
    czasTechnicznyTimelineMs > 0
      ? Math.min(aktualnyCzasTimelineMs, czasTechnicznyTimelineMs)
      : 0;
  const aktywnySegmentCiszyTimeline = segmentyCiszyTimeline.find(
    (segmentCiszy) => segmentCiszy.id === idAktywnegoSegmentuCiszy
  );
  const idAktywnegoSegmentuCiszyTimeline = aktywnySegmentCiszyTimeline?.id;

  function formatujCzasNaTimeline(czasMs: number) {
    return formatujCzas(
      czasMs,
      projekt.ustawienia.formatWyswietlaniaCzasu,
      projekt.ustawienia.liczbaKlatekNaSekunde
    );
  }

  const opisAktywnegoSegmentuCiszy = aktywnySegmentCiszyTimeline
    ? `${formatujCzasNaTimeline(
        aktywnySegmentCiszyTimeline.czasPoczatkuMs
      )} - ${formatujCzasNaTimeline(aktywnySegmentCiszyTimeline.czasKoncaMs)}`
    : undefined;

  function obsluzZmianeCzasuOdtwarzania(czasMs: number) {
    ustawAktualnyCzasTimelineMs(
      ograniczCzasDoZakresu(czasMs, czasTechnicznyTimelineMs)
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

    ustawAktualnyCzasTimelineMs(0);
    ustawCzyPrzeciaganieGlowicy(false);
    ustawProjekt((aktualnyProjekt) =>
      dodajMediumDoProjektu(aktualnyProjekt, wynikImportu.dane)
    );
    ustawPodgladyMediow((aktualnePodglady) => {
      const poprzedniPodglad = aktualnePodglady[idMedium];

      if (
        poprzedniPodglad &&
        poprzedniPodglad.objectUrl !== nowyPodgladMedium.objectUrl
      ) {
        zwolnijObjectUrlPodgladu(poprzedniPodglad);
      }

      const nowePodglady = dodajLubZaktualizujPodgladMedium(
        aktualnePodglady,
        nowyPodgladMedium
      );

      podgladyMediowRef.current = nowePodglady;
      return nowePodglady;
    });
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

  function obsluzZmianeTrybuWygladu(nowyTrybWygladu: string) {
    if (sprawdzCzyTrybWygladuJestPoprawny(nowyTrybWygladu)) {
      ustawTrybWygladu(nowyTrybWygladu);
    }
  }

  const liczbaPropozycjiCiec = projekt.timeline.propozycjeCiec.length;
  const liczbaPropozycjiOczekujacych =
    projekt.timeline.propozycjeCiec.filter(
      (propozycjaCiecia) => propozycjaCiecia.status === "oczekuje"
    ).length;
  const liczbaPropozycjiZatwierdzonych =
    projekt.timeline.propozycjeCiec.filter(
      (propozycjaCiecia) => propozycjaCiecia.status === "zatwierdzona"
    ).length;
  const liczbaPropozycjiOdrzuconych =
    projekt.timeline.propozycjeCiec.filter(
      (propozycjaCiecia) => propozycjaCiecia.status === "odrzucona"
    ).length;
  const statusProjektuUi = okreslStatusProjektuUi({
    liczbaMediow: projekt.media.length,
    statusImportuMediow
  });
  const komunikatPaskaStatusu =
    bladImportuMediow ??
    `Media: ${projekt.media.length} | Segmenty ciszy: ${segmentyCiszyTimeline.length} | Propozycje cięć: ${projekt.timeline.propozycjeCiec.length} | Status: ${pobierzEtykieteStatusuProjektuUi(statusProjektuUi).toLowerCase()}`;

  return (
    <AplikacjaVidEdit
      pasekGorny={
        <PasekGornyAplikacji
          nazwaProjektu={projekt.nazwa}
          statusProjektuUi={statusProjektuUi}
          trybWygladu={trybWygladu}
          liczbaMediow={projekt.media.length}
          naZmianeTrybuWygladu={obsluzZmianeTrybuWygladu}
        />
      }
      panelLewy={
        <PanelBocznyLewy
          dzieci={
            <>
              <PanelWorkflow
                liczbaMediow={projekt.media.length}
                statusImportuMediow={statusImportuMediow}
                liczbaSegmentowCiszy={segmentyCiszyTimeline.length}
                liczbaPropozycjiCiec={liczbaPropozycjiCiec}
                liczbaPropozycjiOczekujacych={liczbaPropozycjiOczekujacych}
                liczbaPropozycjiZatwierdzonych={
                  liczbaPropozycjiZatwierdzonych
                }
                liczbaPropozycjiOdrzuconych={liczbaPropozycjiOdrzuconych}
              />
              <PanelMediowProjektu
                czyMediaDostepne={projekt.media.length > 0}
                dzieci={
                  <>
                    <Panel_Importu_Mediow
                      rozszerzeniaWideo={OBSLUGIWANE_ROZSZERZENIA_WIDEO}
                      bladImportuMediow={bladImportuMediow}
                      statusImportuMediow={statusImportuMediow}
                      naWybranoPlik={obsluzWybraniePliku}
                    />
                    {projekt.media.length > 0 ? (
                      <Lista_Mediow
                        media={projekt.media}
                        podgladyMediow={podgladyMediow}
                      />
                    ) : null}
                  </>
                }
              />
            </>
          }
        />
      }
      obszarRoboczy={
        <ObszarRoboczy
          media={projekt.media}
          klipyTimeline={klipyTimeline}
          podgladyMediow={podgladyMediow}
          czasAktualnyMs={czasAktualnyWZakresieMs}
          uchwytWideoRef={uchwytWideoRef}
          czyPrzeciaganieGlowicy={czyPrzeciaganieGlowicy}
          opisAktywnegoSegmentuCiszy={opisAktywnegoSegmentuCiszy}
          formatujCzasPodgladu={formatujCzasNaTimeline}
          naZmianeCzasuOdtwarzania={obsluzZmianeCzasuOdtwarzania}
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
              klipyTimeline={klipyTimeline}
              czasTrwaniaMs={czasTechnicznyTimelineMs}
              czasAktualnyMs={czasAktualnyWZakresieMs}
              segmentyCiszy={segmentyCiszyTimeline}
              idAktywnegoSegmentuCiszy={idAktywnegoSegmentuCiszyTimeline}
              uchwytWideoRef={uchwytWideoRef}
              formatujCzasTimeline={formatujCzasNaTimeline}
              naZmianeCzasuTimeline={obsluzZmianeCzasuOdtwarzania}
              naZmianePrzeciaganiaGlowicy={ustawCzyPrzeciaganieGlowicy}
              naWybranoSegmentCiszy={obsluzWybranieSegmentuCiszy}
            />
          }
        />
      }
      pasekStatusu={
        <PasekStatusu
          komunikat={komunikatPaskaStatusu}
          statusProjektuUi={statusProjektuUi}
        />
      }
    />
  );
}
