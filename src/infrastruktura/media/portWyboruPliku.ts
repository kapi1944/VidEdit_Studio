import type { DaneImportuPlikuMediow } from "../../domena/media/typyMediow";

export type PortWyboruPliku = {
  wybierzPlikWideo: () => Promise<DaneImportuPlikuMediow | null>;
};
