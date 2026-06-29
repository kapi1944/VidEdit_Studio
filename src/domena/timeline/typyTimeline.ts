import type { CzasMs } from "../czas/typyCzasu";

export type SegmentCzasu = {
  id: string;
  czasPoczatkuMs: CzasMs;
  czasKoncaMs: CzasMs;
};

export type StatusSegmentuCiszy = "oczekuje" | "zatwierdzony" | "odrzucony";

export type SegmentCiszy = SegmentCzasu & {
  poziomGlosnosciDb?: number;
  status: StatusSegmentuCiszy;
};

export type PowodPropozycjiCiecia = "cisza" | "dubel" | "reczne";

export type StatusPropozycjiCiecia =
  | "oczekuje"
  | "zatwierdzona"
  | "odrzucona";

export type PropozycjaCiecia = SegmentCzasu & {
  powod: PowodPropozycjiCiecia;
  status: StatusPropozycjiCiecia;
};

export type TimelineProjektu = {
  segmentyCiszy: SegmentCiszy[];
  propozycjeCiec: PropozycjaCiecia[];
};
