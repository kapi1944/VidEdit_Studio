import type { PlikMediow } from "../../domena/media/typyMediow";
import type {
  KlipTimeline,
  SciezkaTimeline,
  UstawieniaSiatkiTimeline
} from "../../domena/timeline/typyTimeline";
import {
  obliczCzasKoncaKlipu,
  opiszTrybSiatkiTimeline,
  pobierzSciezkaIdKlipuTimeline
} from "../../domena/timeline/typyTimeline";

export type WierszInspektoraKlipu = {
  etykieta: string;
  wartosc: string;
};

export type DaneInspektoraKlipu = {
  wiersze: WierszInspektoraKlipu[];
};

type DaneUtworzeniaInspektoraKlipu = {
  klipTimeline?: KlipTimeline;
  media: PlikMediow[];
  sciezkiTimeline: SciezkaTimeline[];
  ustawieniaSiatkiTimeline: UstawieniaSiatkiTimeline;
  formatujCzasTimeline: (czasMs: number) => string;
};

const etykietyTypowKlipu: Record<KlipTimeline["rodzaj"], string> = {
  wideo: "Wideo",
  grafika: "Grafika"
};

function pobierzNazweKlipu(
  klipTimeline: KlipTimeline,
  plikMediow?: PlikMediow
) {
  if (plikMediow) {
    return plikMediow.nazwaPliku;
  }

  return `${klipTimeline.nazwa} (medium niedostępne)`;
}

function pobierzNazweSciezki(
  klipTimeline: KlipTimeline,
  sciezkiTimeline: SciezkaTimeline[]
) {
  const sciezkaId = pobierzSciezkaIdKlipuTimeline(klipTimeline);
  const sciezkaTimeline = sciezkiTimeline.find(
    (sciezka) => sciezka.id === sciezkaId
  );

  return sciezkaTimeline?.nazwa ?? `Nieznana ścieżka (${sciezkaId})`;
}

export function utworzDaneInspektoraKlipu({
  klipTimeline,
  media,
  sciezkiTimeline,
  ustawieniaSiatkiTimeline,
  formatujCzasTimeline
}: DaneUtworzeniaInspektoraKlipu): DaneInspektoraKlipu | undefined {
  if (!klipTimeline) {
    return undefined;
  }

  const plikMediow = media.find(
    (medium) => medium.id === klipTimeline.idPlikuMediow
  );
  const czasKoncaMs = obliczCzasKoncaKlipu(klipTimeline);

  return {
    wiersze: [
      {
        etykieta: "Medium",
        wartosc: pobierzNazweKlipu(klipTimeline, plikMediow)
      },
      {
        etykieta: "Typ klipu",
        wartosc: etykietyTypowKlipu[klipTimeline.rodzaj]
      },
      {
        etykieta: "Start",
        wartosc: formatujCzasTimeline(klipTimeline.czasStartuMs)
      },
      {
        etykieta: "Koniec",
        wartosc: formatujCzasTimeline(czasKoncaMs)
      },
      {
        etykieta: "Czas trwania",
        wartosc: formatujCzasTimeline(klipTimeline.czasTrwaniaMs)
      },
      {
        etykieta: "Ścieżka",
        wartosc: pobierzNazweSciezki(klipTimeline, sciezkiTimeline)
      },
      {
        etykieta: "Snap / siatka",
        wartosc: opiszTrybSiatkiTimeline(ustawieniaSiatkiTimeline)
      }
    ]
  };
}
