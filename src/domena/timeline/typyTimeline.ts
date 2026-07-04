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

export const POWODY_PROPOZYCJI_CIEC = ["cisza", "dubel", "reczne"] as const;

export type PowodPropozycjiCiecia = (typeof POWODY_PROPOZYCJI_CIEC)[number];

export const STATUSY_PROPOZYCJI_CIEC = [
  "oczekuje",
  "zatwierdzona",
  "odrzucona"
] as const;

export type StatusPropozycjiCiecia =
  (typeof STATUSY_PROPOZYCJI_CIEC)[number];

export type PropozycjaCiecia = SegmentCzasu & {
  idSegmentuCiszy?: string;
  powod: PowodPropozycjiCiecia;
  status: StatusPropozycjiCiecia;
  utworzonoAutomatycznie: boolean;
};

export type TimelineProjektu = {
  segmentyCiszy: SegmentCiszy[];
  propozycjeCiec: PropozycjaCiecia[];
};
