import type { ProjektMontazu } from "../../domena/projekt/typyProjektu";

export type PortZapisuProjektu = {
  zapiszProjekt: (projekt: ProjektMontazu) => Promise<void>;
  wczytajProjekt: (sciezkaPliku: string) => Promise<ProjektMontazu>;
};
