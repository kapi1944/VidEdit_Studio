import type { MetadaneWideo, PlikMediow } from "../media/typyMediow";
import { zwalidujMetadaneWideo } from "../media/walidacjaMetadanychWideo";
import type { ProjektMontazu } from "./typyProjektu";

export function dodajMediumDoProjektu(
  projekt: ProjektMontazu,
  plikMediow: PlikMediow
): ProjektMontazu {
  const mediaBezZastapionegoPliku = projekt.media.filter((medium) => {
    if (medium.id === plikMediow.id) {
      return false;
    }

    if (plikMediow.typ === "wideo" && medium.typ === "wideo") {
      return false;
    }

    return true;
  });

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
