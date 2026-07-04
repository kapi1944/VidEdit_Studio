import type { MetadaneWideo, PlikMediow } from "../media/typyMediow";
import {
  DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE,
  type PropozycjaCiecia
} from "../timeline/typyTimeline";
import { zwalidujMetadaneWideo } from "../media/walidacjaMetadanychWideo";
import type { ProjektMontazu } from "./typyProjektu";

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

export function zaktualizujPropozycjeCiecWProjekcie(
  projekt: ProjektMontazu,
  propozycjeCiec: PropozycjaCiecia[]
): ProjektMontazu {
  const timeline = projekt.timeline ?? {
    klipy: [],
    ustawieniaDociagania: DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE,
    segmentyCiszy: [],
    propozycjeCiec: []
  };

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
