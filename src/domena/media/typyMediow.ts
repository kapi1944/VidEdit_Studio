import type { CzasMs } from "../czas/typyCzasu";

export type TypPlikuMediow = "wideo" | "audio";

export type PlikMediow = {
  id: string;
  nazwaPliku: string;
  sciezkaPliku: string;
  typ: TypPlikuMediow;
  czasTrwaniaMs?: CzasMs;
};

export type DaneImportuPlikuMediow = {
  id?: string;
  nazwaPliku: string;
  sciezkaPliku: string;
  czasTrwaniaMs?: CzasMs;
  rozmiarBajtow?: number;
};
