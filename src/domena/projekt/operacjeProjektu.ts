import type { PlikMediow } from "../media/typyMediow";
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
