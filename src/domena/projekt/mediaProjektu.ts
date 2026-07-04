import type { PlikMediow } from "../media/typyMediow";
import type { ProjektMontazu } from "./typyProjektu";
import { dodajMediumDoProjektu } from "./operacjeProjektu";

export { dodajMediumDoProjektu };

export type MetadaneWideoPlikuMediow = Pick<
  PlikMediow,
  "czasTrwaniaMs" | "szerokoscWideo" | "wysokoscWideo"
>;

export function dodajPlikDoProjektu(
  projekt: ProjektMontazu,
  plikMediow: PlikMediow
): ProjektMontazu {
  return dodajMediumDoProjektu(projekt, plikMediow);
}

export function aktualizujMetadaneWideoPlikuMediow(
  projekt: ProjektMontazu,
  idPlikuMediow: string,
  metadaneWideo: MetadaneWideoPlikuMediow
): ProjektMontazu {
  return {
    ...projekt,
    dataModyfikacjiIso: new Date().toISOString(),
    media: projekt.media.map((plikMediow) =>
      plikMediow.id === idPlikuMediow
        ? {
            ...plikMediow,
            ...metadaneWideo
          }
        : plikMediow
    )
  };
}
