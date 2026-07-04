import type { MetadaneWideo } from "../../domena/media/typyMediow";

export type PortOdczytuMetadanych = {
  odczytajMetadaneWideoZPliku: (plik: File) => Promise<MetadaneWideo>;
};
