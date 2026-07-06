import type { MetadaneWideo, PlikMediow } from "../media/typyMediow";
import {
  DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE,
  obliczDlugoscTimelineZKlipow,
  type RodzajKlipuTimeline,
  utworzKlipTimeline,
  walidujKlipTimeline,
  type PropozycjaCiecia
} from "../timeline/typyTimeline";
import { zwalidujMetadaneWideo } from "../media/walidacjaMetadanychWideo";
import type { ProjektMontazu } from "./typyProjektu";
import type { BladWalidacji } from "../../wspolne/bledy";
import { blad, sukces, type Wynik } from "../../wspolne/wynik";

function czyMediumMozeBycKlipemTimeline(
  medium: PlikMediow
): medium is PlikMediow & { typ: RodzajKlipuTimeline } {
  return medium.typ === "wideo" || medium.typ === "grafika";
}

function pobierzTimelineProjektu(projekt: ProjektMontazu) {
  return (
    projekt.timeline ?? {
      klipy: [],
      markery: [],
      ustawieniaDociagania: DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE,
      segmentyCiszy: [],
      propozycjeCiec: []
    }
  );
}

export function dodajMediumDoProjektu(
  projekt: ProjektMontazu,
  plikMediow: PlikMediow
): ProjektMontazu {
  const mediaBezZastapionegoPliku = projekt.media.filter(
    (medium) => medium.id !== plikMediow.id
  );

  return {
    ...projekt,
    dataModyfikacjiIso: new Date().toISOString(),
    media: [...mediaBezZastapionegoPliku, plikMediow]
  };
}

export function zaktualizujMetadaneMediumWProjekcie(
  projekt: ProjektMontazu,
  idMedium: string,
  metadane: MetadaneWideo
): ProjektMontazu {
  const czyMediumIstnieje = projekt.media.some((medium) => medium.id === idMedium);

  if (!czyMediumIstnieje || zwalidujMetadaneWideo(metadane).length > 0) {
    return projekt;
  }

  return {
    ...projekt,
    dataModyfikacjiIso: new Date().toISOString(),
    media: projekt.media.map((medium) =>
      medium.id === idMedium
        ? {
            ...medium,
            metadane,
            ...(metadane.czasTrwaniaMs !== undefined
              ? { czasTrwaniaMs: metadane.czasTrwaniaMs }
              : {})
          }
        : medium
      )
  };
}

export function dodajMediumNaTimeline(
  projekt: ProjektMontazu,
  idMedium: string,
  czasStartuMs?: number
): Wynik<ProjektMontazu, BladWalidacji> {
  const medium = projekt.media.find(
    (plikMediow) => plikMediow.id === idMedium
  );

  if (!medium) {
    return blad({
      pole: "idMedium",
      komunikat: "Nie znaleziono medium w bibliotece projektu."
    });
  }

  if (!czyMediumMozeBycKlipemTimeline(medium)) {
    return blad({
      pole: "typ",
      komunikat: "Ten typ medium nie moze zostac dodany na timeline."
    });
  }

  const timeline = pobierzTimelineProjektu(projekt);
  const czasStartuKlipuMs =
    czasStartuMs ?? obliczDlugoscTimelineZKlipow(timeline.klipy);
  const klipTimeline = utworzKlipTimeline({
    plikMediow: medium,
    czasStartuMs: czasStartuKlipuMs
  });
  const bledyKlipu = walidujKlipTimeline(
    klipTimeline,
    projekt.media.map((plikMediow) => plikMediow.id)
  );

  if (bledyKlipu.length > 0) {
    return blad(bledyKlipu);
  }

  return sukces({
    ...projekt,
    dataModyfikacjiIso: new Date().toISOString(),
    timeline: {
      ...timeline,
      klipy: [...timeline.klipy, klipTimeline]
    }
  });
}

export function zaktualizujPropozycjeCiecWProjekcie(
  projekt: ProjektMontazu,
  propozycjeCiec: PropozycjaCiecia[]
): ProjektMontazu {
  const timeline = pobierzTimelineProjektu(projekt);

  if (timeline.propozycjeCiec === propozycjeCiec) {
    return projekt;
  }

  return {
    ...projekt,
    dataModyfikacjiIso: new Date().toISOString(),
    timeline: {
      ...timeline,
      propozycjeCiec
    }
  };
}
