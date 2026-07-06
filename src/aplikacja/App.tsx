import { useEffect, useRef, useState } from "react";
import {
  AplikacjaVidEdit,
  ObszarRoboczy,
  PanelBocznyLewy,
  PanelBocznyPrawy,
  PanelMediowProjektu,
  PanelSzybkichAkcjiLite,
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
  dodajMediumNaTimeline,
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
  KlipTimeline,
  MarkerTimeline,
  PropozycjaCiecia,
  SegmentCiszy,
  UstawieniaSiatkiTimeline
} from "../domena/timeline/typyTimeline";
import {
  dodajMarkerTimeline,
  DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE,
  obliczCzasKoncaKlipu,
  pobierzKrokEdycjiTimeline,
  pobierzSciezkiTimelineZFallbackiem,
  przetnijKlipTimeline,
  przesunKlipTimeline,
  skrocKoniecKlipuTimeline,
  skrocPoczatekKlipuTimeline,
  usunMarkerTimeline
} from "../domena/timeline/typyTimeline";
import {
  domyslnyMotywInterfejsu,
  domyslneRozmiaryLayoutu,
  domyslnyTrybInterfejsu,
  pobierzOgraniczoneRozmiaryLayoutu,
  pobierzWidocznoscFunkcjiDlaTrybu,
  sprawdzCzyMotywInterfejsuJestPoprawny,
  sprawdzCzyTrybInterfejsuJestPoprawny,
  type MotywInterfejsu,
  type RozmiaryLayoutu,
  type TrybInterfejsu
} from "./ustawieniaInterfejsu";
import {
  czySkrotCieciaTimeline,
  czySkrotyTimelineDozwolone
} from "./skrotyTimeline";

type TrybWygladu = "jasny" | "ciemny" | "systemowy";

const kluczTrybuWygladu = "videdit-studio.tryb-wygladu";
const kluczMotywuInterfejsu = "videdit-studio.motyw-interfejsu";
const kluczTrybuInterfejsu = "videdit-studio.tryb-interfejsu";
const kluczRozmiarowLayoutu = "videdit-studio.rozmiary-layoutu";
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

function pobierzPoczatkowyMotywInterfejsu(): MotywInterfejsu {
  const zapisanyMotywInterfejsu = localStorage.getItem(kluczMotywuInterfejsu);

  if (sprawdzCzyMotywInterfejsuJestPoprawny(zapisanyMotywInterfejsu)) {
    return zapisanyMotywInterfejsu;
  }

  return domyslnyMotywInterfejsu;
}

function pobierzPoczatkowyTrybInterfejsu(): TrybInterfejsu {
  const zapisanyTrybInterfejsu = localStorage.getItem(kluczTrybuInterfejsu);

  if (sprawdzCzyTrybInterfejsuJestPoprawny(zapisanyTrybInterfejsu)) {
    return zapisanyTrybInterfejsu;
  }

  return domyslnyTrybInterfejsu;
}

function pobierzPoczatkoweRozmiaryLayoutu(): RozmiaryLayoutu {
  const zapisaneRozmiaryLayoutu = localStorage.getItem(kluczRozmiarowLayoutu);

  if (!zapisaneRozmiaryLayoutu) {
    return domyslneRozmiaryLayoutu;
  }

  try {
    const rozmiaryLayoutu = JSON.parse(zapisaneRozmiaryLayoutu) as Partial<
      Record<keyof RozmiaryLayoutu, unknown>
    >;

    return pobierzOgraniczoneRozmiaryLayoutu({
      szerokoscPaneluLewegoPx:
        typeof rozmiaryLayoutu.szerokoscPaneluLewegoPx === "number"
          ? rozmiaryLayoutu.szerokoscPaneluLewegoPx
          : undefined,
      szerokoscPaneluPrawegoPx:
        typeof rozmiaryLayoutu.szerokoscPaneluPrawegoPx === "number"
          ? rozmiaryLayoutu.szerokoscPaneluPrawegoPx
          : undefined,
      wysokoscTimelinePx:
        typeof rozmiaryLayoutu.wysokoscTimelinePx === "number"
          ? rozmiaryLayoutu.wysokoscTimelinePx
          : undefined
    });
  } catch {
    return domyslneRozmiaryLayoutu;
  }
}

export function Aplikacja() {
  const [projekt, ustawProjekt] = useState(() =>
    utworzPustyProjekt("Nowy projekt")
  );
  const [bladImportuMediow, ustawBladImportuMediow] = useState<string>();
  const [statusImportuMediow, ustawStatusImportuMediow] =
    useState<StatusImportuMediow>("bezczynny");
  const [trybWygladu, ustawTrybWygladu] = useState(pobierzPoczatkowyTrybWygladu);
  const [motywInterfejsu, ustawMotywInterfejsu] = useState(
    pobierzPoczatkowyMotywInterfejsu
  );
  const [trybInterfejsu, ustawTrybInterfejsu] = useState(
    pobierzPoczatkowyTrybInterfejsu
  );
  const [rozmiaryLayoutu, ustawRozmiaryLayoutu] = useState(
    pobierzPoczatkoweRozmiaryLayoutu
  );
  const [podgladyMediow, ustawPodgladyMediow] = useState<PodgladyMediow>({});
  const [idAktywnegoSegmentuCiszy, ustawIdAktywnegoSegmentuCiszy] =
    useState<string>();
  const [idZaznaczonegoKlipuTimeline, ustawIdZaznaczonegoKlipuTimeline] =
    useState<string>();
  const [aktualnyCzasTimelineMs, ustawAktualnyCzasTimelineMs] = useState(0);
  const [ustawieniaSiatkiTimeline, ustawUstawieniaSiatkiTimeline] =
    useState<UstawieniaSiatkiTimeline>(
      DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE
    );
  const [czyPrzeciaganieGlowicy, ustawCzyPrzeciaganieGlowicy] =
    useState(false);
  const uchwytWideoRef = useRef<HTMLVideoElement>(null);
  const podgladyMediowRef = useRef<PodgladyMediow>({});

  useEffect(() => {
    document.documentElement.dataset.trybWygladu = trybWygladu;
    localStorage.setItem(kluczTrybuWygladu, trybWygladu);
  }, [trybWygladu]);

  useEffect(() => {
    document.documentElement.dataset.motyw = motywInterfejsu;
    localStorage.setItem(kluczMotywuInterfejsu, motywInterfejsu);
  }, [motywInterfejsu]);

  useEffect(() => {
    document.documentElement.dataset.trybInterfejsu = trybInterfejsu;
    localStorage.setItem(kluczTrybuInterfejsu, trybInterfejsu);
  }, [trybInterfejsu]);

  useEffect(() => {
    localStorage.setItem(
      kluczRozmiarowLayoutu,
      JSON.stringify(rozmiaryLayoutu)
    );
  }, [rozmiaryLayoutu]);

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
  const markeryTimeline = projekt.timeline.markery ?? [];
  const sciezkiTimeline = pobierzSciezkiTimelineZFallbackiem(
    projekt.timeline.sciezki
  );
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

  function zaktualizujMarkeryTimeline(
    zaktualizuj: (markery: MarkerTimeline[]) => MarkerTimeline[] | undefined
  ) {
    ustawProjekt((aktualnyProjekt) => {
      const noweMarkery = zaktualizuj(aktualnyProjekt.timeline.markery ?? []);

      if (!noweMarkery) {
        return aktualnyProjekt;
      }

      return {
        ...aktualnyProjekt,
        dataModyfikacjiIso: new Date().toISOString(),
        timeline: {
          ...aktualnyProjekt.timeline,
          markery: noweMarkery
        }
      };
    });
  }

  function obsluzDodanieMediumNaTimeline(idMedium: string) {
    ustawProjekt((aktualnyProjekt) => {
      const wynikDodania = dodajMediumNaTimeline(aktualnyProjekt, idMedium);

      if (!wynikDodania.czySukces) {
        ustawBladImportuMediow(
          wynikDodania.bledy[0]?.komunikat ??
            "Nie udalo sie dodac medium na timeline."
        );
        return aktualnyProjekt;
      }

      ustawBladImportuMediow(undefined);
      return wynikDodania.dane;
    });
  }

  function obsluzPrzeciecieZaznaczonegoKlipu() {
    if (!idZaznaczonegoKlipuTimeline) {
      ustawBladImportuMediow("Najpierw zaznacz klip do ciecia.");
      return;
    }

    ustawProjekt((aktualnyProjekt) => {
      const wynikCiecia = przetnijKlipTimeline(
        aktualnyProjekt.timeline.klipy,
        idZaznaczonegoKlipuTimeline,
        czasAktualnyWZakresieMs / 1000,
        ustawieniaSiatkiTimeline,
        aktualnyProjekt.ustawienia.liczbaKlatekNaSekunde
      );

      if (!wynikCiecia.czySukces) {
        ustawBladImportuMediow(
          wynikCiecia.bledy[0]?.komunikat ??
            "Nie udalo sie przeciac klipu timeline."
        );
        return aktualnyProjekt;
      }

      ustawBladImportuMediow(undefined);
      ustawIdZaznaczonegoKlipuTimeline(undefined);

      return {
        ...aktualnyProjekt,
        dataModyfikacjiIso: new Date().toISOString(),
        timeline: {
          ...aktualnyProjekt.timeline,
          klipy: wynikCiecia.dane
        }
      };
    });
  }

  useEffect(() => {
    function obsluzSkrotTimeline(zdarzenie: KeyboardEvent) {
      if (
        !czySkrotyTimelineDozwolone(document.activeElement) ||
        !czySkrotCieciaTimeline(zdarzenie)
      ) {
        return;
      }

      zdarzenie.preventDefault();
      obsluzPrzeciecieZaznaczonegoKlipu();
    }

    document.addEventListener("keydown", obsluzSkrotTimeline);

    return () => {
      document.removeEventListener("keydown", obsluzSkrotTimeline);
    };
  }, [
    czasAktualnyWZakresieMs,
    idZaznaczonegoKlipuTimeline,
    ustawieniaSiatkiTimeline
  ]);

  function zastosujEdycjeKlipowTimeline(
    edytujKlipy: (
      aktualnyProjekt: typeof projekt,
      idKlipu: string,
      krokEdycjiSekundy: number
    ) => ReturnType<typeof przetnijKlipTimeline>
  ) {
    if (!idZaznaczonegoKlipuTimeline) {
      return;
    }

    ustawProjekt((aktualnyProjekt) => {
      const krokEdycjiSekundy = pobierzKrokEdycjiTimeline(
        ustawieniaSiatkiTimeline,
        aktualnyProjekt.ustawienia.liczbaKlatekNaSekunde
      );
      const wynikEdycji = edytujKlipy(
        aktualnyProjekt,
        idZaznaczonegoKlipuTimeline,
        krokEdycjiSekundy
      );

      if (!wynikEdycji.czySukces) {
        ustawBladImportuMediow(
          wynikEdycji.bledy[0]?.komunikat ??
            "Nie udalo sie edytowac klipu timeline."
        );
        return aktualnyProjekt;
      }

      ustawBladImportuMediow(undefined);

      return {
        ...aktualnyProjekt,
        dataModyfikacjiIso: new Date().toISOString(),
        timeline: {
          ...aktualnyProjekt.timeline,
          klipy: wynikEdycji.dane
        }
      };
    });
  }

  function obsluzPrzesuniecieKlipuWLewo() {
    zastosujEdycjeKlipowTimeline((aktualnyProjekt, idKlipu, krokEdycji) => {
      const klip = aktualnyProjekt.timeline.klipy.find(
        (klipTimeline) => klipTimeline.id === idKlipu
      );

      return przesunKlipTimeline(
        aktualnyProjekt.timeline.klipy,
        idKlipu,
        ((klip?.czasStartuMs ?? 0) / 1000) - krokEdycji,
        ustawieniaSiatkiTimeline,
        aktualnyProjekt.ustawienia.liczbaKlatekNaSekunde
      );
    });
  }

  function obsluzPrzesuniecieKlipuWPrawo() {
    zastosujEdycjeKlipowTimeline((aktualnyProjekt, idKlipu, krokEdycji) => {
      const klip = aktualnyProjekt.timeline.klipy.find(
        (klipTimeline) => klipTimeline.id === idKlipu
      );

      return przesunKlipTimeline(
        aktualnyProjekt.timeline.klipy,
        idKlipu,
        ((klip?.czasStartuMs ?? 0) / 1000) + krokEdycji,
        ustawieniaSiatkiTimeline,
        aktualnyProjekt.ustawienia.liczbaKlatekNaSekunde
      );
    });
  }

  function obsluzSkroceniePoczatkuKlipu() {
    zastosujEdycjeKlipowTimeline((aktualnyProjekt, idKlipu, krokEdycji) => {
      const klip = aktualnyProjekt.timeline.klipy.find(
        (klipTimeline) => klipTimeline.id === idKlipu
      );

      return skrocPoczatekKlipuTimeline(
        aktualnyProjekt.timeline.klipy,
        idKlipu,
        ((klip?.czasStartuMs ?? 0) / 1000) + krokEdycji,
        ustawieniaSiatkiTimeline,
        aktualnyProjekt.ustawienia.liczbaKlatekNaSekunde
      );
    });
  }

  function obsluzSkrocenieKoncaKlipu() {
    zastosujEdycjeKlipowTimeline((aktualnyProjekt, idKlipu, krokEdycji) => {
      const klip = aktualnyProjekt.timeline.klipy.find(
        (klipTimeline) => klipTimeline.id === idKlipu
      );
      const czasKoncaKlipuMs = klip ? obliczCzasKoncaKlipu(klip) : 0;

      return skrocKoniecKlipuTimeline(
        aktualnyProjekt.timeline.klipy,
        idKlipu,
        czasKoncaKlipuMs / 1000 - krokEdycji,
        ustawieniaSiatkiTimeline,
        aktualnyProjekt.ustawienia.liczbaKlatekNaSekunde
      );
    });
  }

  function obsluzZmianeKlipuTimeline(klipPoZmianie: KlipTimeline) {
    ustawProjekt((aktualnyProjekt) => ({
      ...aktualnyProjekt,
      dataModyfikacjiIso: new Date().toISOString(),
      timeline: {
        ...aktualnyProjekt.timeline,
        klipy: aktualnyProjekt.timeline.klipy.map((klipTimeline) =>
          klipTimeline.id === klipPoZmianie.id ? klipPoZmianie : klipTimeline
        )
      }
    }));
  }

  function obsluzDodanieMarkeraTimeline() {
    zaktualizujMarkeryTimeline((aktualneMarkery) => {
      const wynikDodania = dodajMarkerTimeline(
        aktualneMarkery,
        czasAktualnyWZakresieMs / 1000,
        ustawieniaSiatkiTimeline,
        projekt.ustawienia.liczbaKlatekNaSekunde
      );

      if (!wynikDodania.czySukces) {
        ustawBladImportuMediow(
          wynikDodania.bledy[0]?.komunikat ??
            "Nie udalo sie dodac markera timeline."
        );
        return undefined;
      }

      ustawBladImportuMediow(undefined);
      return wynikDodania.dane;
    });
  }

  function obsluzUsuniecieMarkeraTimeline(idMarkera: string) {
    zaktualizujMarkeryTimeline((aktualneMarkery) => {
      const wynikUsuniecia = usunMarkerTimeline(aktualneMarkery, idMarkera);

      if (!wynikUsuniecia.czySukces) {
        ustawBladImportuMediow(
          wynikUsuniecia.bledy[0]?.komunikat ??
            "Nie udalo sie usunac markera timeline."
        );
        return undefined;
      }

      ustawBladImportuMediow(undefined);
      return wynikUsuniecia.dane;
    });
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

  function obsluzZmianeMotywuInterfejsu(nowyMotywInterfejsu: string) {
    if (sprawdzCzyMotywInterfejsuJestPoprawny(nowyMotywInterfejsu)) {
      ustawMotywInterfejsu(nowyMotywInterfejsu);
    }
  }

  function obsluzZmianeTrybuInterfejsu(nowyTrybInterfejsu: TrybInterfejsu) {
    ustawTrybInterfejsu(nowyTrybInterfejsu);
  }

  function obsluzZmianeRozmiarowLayoutu(
    noweRozmiaryLayoutu: Partial<RozmiaryLayoutu>
  ) {
    ustawRozmiaryLayoutu((aktualneRozmiaryLayoutu) =>
      pobierzOgraniczoneRozmiaryLayoutu({
        ...aktualneRozmiaryLayoutu,
        ...noweRozmiaryLayoutu
      })
    );
  }

  function obsluzResetUkladu() {
    ustawRozmiaryLayoutu(domyslneRozmiaryLayoutu);
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
  const widocznoscFunkcji =
    pobierzWidocznoscFunkcjiDlaTrybu(trybInterfejsu);
  const komunikatPaskaStatusu =
    bladImportuMediow ??
    `Media: ${projekt.media.length} | Segmenty ciszy: ${segmentyCiszyTimeline.length} | Propozycje cięć: ${projekt.timeline.propozycjeCiec.length} | Status: ${pobierzEtykieteStatusuProjektuUi(statusProjektuUi).toLowerCase()}`;

  return (
    <AplikacjaVidEdit
      rozmiaryLayoutu={rozmiaryLayoutu}
      naZmianeRozmiarowLayoutu={obsluzZmianeRozmiarowLayoutu}
      pasekGorny={
        <PasekGornyAplikacji
          nazwaProjektu={projekt.nazwa}
          statusProjektuUi={statusProjektuUi}
          trybWygladu={trybWygladu}
          motywInterfejsu={motywInterfejsu}
          trybInterfejsu={trybInterfejsu}
          liczbaMediow={projekt.media.length}
          czyPokazacZaawansowaneParametryEksportu={
            widocznoscFunkcji.pokazZaawansowaneParametryEksportu
          }
          naZmianeTrybuWygladu={obsluzZmianeTrybuWygladu}
          naZmianeMotywuInterfejsu={obsluzZmianeMotywuInterfejsu}
          naZmianeTrybuInterfejsu={obsluzZmianeTrybuInterfejsu}
          naResetUkladu={obsluzResetUkladu}
        />
      }
      panelLewy={
        <PanelBocznyLewy
          dzieci={
            <>
              {widocznoscFunkcji.pokazPanelSzybkichAkcji ? (
                <PanelSzybkichAkcjiLite />
              ) : null}
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
                        naDodajNaTimeline={obsluzDodanieMediumNaTimeline}
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
        widocznoscFunkcji.pokazPelnyInspektor ? (
          <PanelBocznyPrawy
            dzieci={
              <Panel_Propozycji_Ciec
                propozycjeCiec={projekt.timeline.propozycjeCiec}
                formatujCzasCiecia={formatujCzasNaTimeline}
                naZatwierdz={obsluzZatwierdzeniePropozycjiCiecia}
                naOdrzuc={obsluzOdrzuceniePropozycjiCiecia}
                naCofnijDecyzje={obsluzCofniecieDecyzjiPropozycjiCiecia}
                naZatwierdzWszystkie={
                  obsluzZatwierdzenieWszystkichPropozycjiCiec
                }
              />
            }
          />
        ) : null
      }
      timeline={
        <TimelineMontazu
          dzieci={
            <Panel_Osi_Czasu
              nazwaProjektu={projekt.nazwa}
              klipyTimeline={klipyTimeline}
              sciezkiTimeline={sciezkiTimeline}
              markeryTimeline={markeryTimeline}
              czasTrwaniaMs={czasTechnicznyTimelineMs}
              czasAktualnyMs={czasAktualnyWZakresieMs}
              segmentyCiszy={segmentyCiszyTimeline}
              idAktywnegoSegmentuCiszy={idAktywnegoSegmentuCiszyTimeline}
              idZaznaczonegoKlipuTimeline={idZaznaczonegoKlipuTimeline}
              uchwytWideoRef={uchwytWideoRef}
              formatujCzasTimeline={formatujCzasNaTimeline}
              fpsTimeline={projekt.ustawienia.liczbaKlatekNaSekunde}
              ustawieniaSiatkiTimeline={ustawieniaSiatkiTimeline}
              czyPokazacZaawansowaneUstawienia={
                widocznoscFunkcji.pokazZaawansowaneUstawieniaTimeline
              }
              naZmianeCzasuTimeline={obsluzZmianeCzasuOdtwarzania}
              naZmianeUstawienSiatkiTimeline={ustawUstawieniaSiatkiTimeline}
              naDodajMarkerTimeline={obsluzDodanieMarkeraTimeline}
              naUsunMarkerTimeline={obsluzUsuniecieMarkeraTimeline}
              naZaznaczKlipTimeline={ustawIdZaznaczonegoKlipuTimeline}
              naZmienKlipTimeline={obsluzZmianeKlipuTimeline}
              naPrzetnijZaznaczonyKlip={obsluzPrzeciecieZaznaczonegoKlipu}
              naPrzesunZaznaczonyKlipWLewo={obsluzPrzesuniecieKlipuWLewo}
              naPrzesunZaznaczonyKlipWPrawo={obsluzPrzesuniecieKlipuWPrawo}
              naSkrocPoczatekZaznaczonegoKlipu={obsluzSkroceniePoczatkuKlipu}
              naSkrocKoniecZaznaczonegoKlipu={obsluzSkrocenieKoncaKlipu}
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
