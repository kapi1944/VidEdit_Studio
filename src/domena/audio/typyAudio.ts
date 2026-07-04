import type { CzasMs } from "../czas/typyCzasu";
import type { SegmentCiszy } from "../timeline/typyTimeline";

export type StatusAnalizyAudio =
  | "brak"
  | "oczekuje"
  | "w_trakcie"
  | "ukonczona"
  | "blad";

export const STATUSY_ANALIZY_AUDIO: StatusAnalizyAudio[] = [
  "brak",
  "oczekuje",
  "w_trakcie",
  "ukonczona",
  "blad"
];

export type SciezkaAudio = {
  id: string;
  sciezkaPlikuZrodlowego: string;
  sciezkaPlikuAudio: string;
  czasTrwaniaMs: CzasMs;
  format: "wav";
  liczbaKanalow: number;
  probkowanieHz: number;
};

export type DaneAudioProjektu = {
  sciezkaAudio?: SciezkaAudio;
  statusAnalizyAudio: StatusAnalizyAudio;
  segmentyCiszy: SegmentCiszy[];
  ostatniBladAudio?: string;
};
