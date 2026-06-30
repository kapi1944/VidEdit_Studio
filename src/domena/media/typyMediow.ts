import type { CzasMs } from "../czas/typyCzasu";

export type TypPlikuMediow = "wideo" | "audio";
export type StatusImportuMediow = "zaimportowany";

export type PlikMediow = {
  id: string;
  nazwaPliku: string;
  rozszerzenie: string;
  typMime: string;
  rozmiarBajtow: number;
  objectUrl: string;
  statusImportu: StatusImportuMediow;
  typ: TypPlikuMediow;
  dataModyfikacjiPlikuIso?: string;
  szerokoscWideo?: number;
  wysokoscWideo?: number;
  czasTrwaniaMs?: CzasMs;
};

export type DaneImportuPlikuMediow = {
  id?: string;
  nazwaPliku: string;
  rozszerzenie: string;
  typMime: string;
  rozmiarBajtow: number;
  objectUrl: string;
  statusImportu?: StatusImportuMediow;
  dataModyfikacjiPlikuIso?: string;
  czasTrwaniaMs?: CzasMs;
};

export type PlikDoWalidacjiMediow = {
  name: string;
  type: string;
  size: number;
};
