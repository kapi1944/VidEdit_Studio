import type { CzasMs } from "../../domena/czas/typyCzasu";

export type ProbkaGlosnosciAudio = {
  czasPoczatkuMs: CzasMs;
  czasKoncaMs: CzasMs;
  poziomDb: number;
};

export type UstawieniaWykrywaniaCiszy = {
  progCiszyDb: number;
  minimalnaDlugoscCiszyMs: CzasMs;
  marginesPrzedMs: CzasMs;
  marginesPoMs: CzasMs;
  minimalnaPrzerwaMiedzySegmentamiMs: CzasMs;
};

export type PresetWykrywaniaCiszy = "delikatny" | "normalny" | "agresywny";

export type SurowySegmentCiszy = {
  czasPoczatkuMs: CzasMs;
  czasKoncaMs: CzasMs;
  lacznyCzasCiszyMs: CzasMs;
  sumaPoziomowDbWazonaCzasem: number;
};
