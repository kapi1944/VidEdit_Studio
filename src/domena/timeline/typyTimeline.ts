import type { CzasMs } from "../czas/typyCzasu";
import type { PlikMediow } from "../media/typyMediow";
import type { BladWalidacji } from "../../wspolne/bledy";

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

export type RodzajKlipuTimeline = "wideo" | "grafika";

export type KlipTimeline = {
  id: string;
  idPlikuMediow: string;
  rodzaj: RodzajKlipuTimeline;
  czasStartuMs: CzasMs;
  czasTrwaniaMs: CzasMs;
  zrodloStartMs?: CzasMs;
  zrodloKoniecMs?: CzasMs;
  sciezka: "wideo-1";
  nazwa: string;
  kolor?: string;
  czyZablokowany?: boolean;
};

export const DOMYSLNY_CZAS_TRWANIA_GRAFIKI_MS = 5000;

export type TrybDociaganiaTimeline = "czas" | "klatki" | "brak";

export type JednostkaDociaganiaTimeline =
  | "brak"
  | "sekunda"
  | "polSekundy"
  | "dziesiataSekundy"
  | "jednaKlatka"
  | "piecKlatek"
  | "dziesiecKlatek";

export type UstawieniaDociaganiaTimeline = {
  wlaczone: boolean;
  tryb: TrybDociaganiaTimeline;
  jednostka: JednostkaDociaganiaTimeline;
  krokMs?: CzasMs;
  liczbaKlatek?: number;
  fpsBazowy?: number;
};

export type UstawieniaSiatkiTimeline = UstawieniaDociaganiaTimeline;

export type DaneUtworzeniaKlipuTimeline = {
  id?: string;
  plikMediow: PlikMediow & { typ: RodzajKlipuTimeline };
  czasStartuMs?: CzasMs;
  czasTrwaniaMs?: CzasMs;
  zrodloStartMs?: CzasMs;
  zrodloKoniecMs?: CzasMs;
  sciezka?: "wideo-1";
  nazwa?: string;
  kolor?: string;
  czyZablokowany?: boolean;
};

export const DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE: UstawieniaDociaganiaTimeline =
  {
    wlaczone: false,
    tryb: "brak",
    jednostka: "brak"
  };

export const USTAWIENIA_DOCIAGANIA_TIMELINE_MVP: UstawieniaDociaganiaTimeline[] =
  [
    DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE,
    { wlaczone: true, tryb: "czas", jednostka: "sekunda", krokMs: 1000 },
    { wlaczone: true, tryb: "czas", jednostka: "polSekundy", krokMs: 500 },
    {
      wlaczone: true,
      tryb: "czas",
      jednostka: "dziesiataSekundy",
      krokMs: 100
    },
    {
      wlaczone: true,
      tryb: "klatki",
      jednostka: "jednaKlatka",
      liczbaKlatek: 1
    },
    {
      wlaczone: true,
      tryb: "klatki",
      jednostka: "piecKlatek",
      liczbaKlatek: 5
    },
    {
      wlaczone: true,
      tryb: "klatki",
      jednostka: "dziesiecKlatek",
      liczbaKlatek: 10
    }
  ];

const OPISY_SIATKI_TIMELINE: Record<JednostkaDociaganiaTimeline, string> = {
  brak: "Bez dociagania",
  sekunda: "1 s",
  polSekundy: "0,5 s",
  dziesiataSekundy: "0,1 s",
  jednaKlatka: "1 klatka",
  piecKlatek: "5 klatek",
  dziesiecKlatek: "10 klatek"
};

function zaokraglijStabilnie(czasSekundy: number) {
  return Number(Math.max(0, czasSekundy).toFixed(6));
}

function pobierzFpsSiatki(
  ustawieniaSiatki: UstawieniaSiatkiTimeline,
  fps?: number
) {
  const fpsDoUzycia = fps ?? ustawieniaSiatki.fpsBazowy ?? 25;

  return Number.isFinite(fpsDoUzycia) && fpsDoUzycia > 0 ? fpsDoUzycia : 25;
}

function pobierzKrokSiatkiWSekundach(
  ustawieniaSiatki: UstawieniaSiatkiTimeline,
  fps?: number
) {
  if (
    !ustawieniaSiatki.wlaczone ||
    ustawieniaSiatki.tryb === "brak" ||
    ustawieniaSiatki.jednostka === "brak"
  ) {
    return undefined;
  }

  if (ustawieniaSiatki.tryb === "czas") {
    return (ustawieniaSiatki.krokMs ?? 0) / 1000;
  }

  if (ustawieniaSiatki.tryb === "klatki") {
    return (
      (ustawieniaSiatki.liczbaKlatek ?? 1) /
      pobierzFpsSiatki(ustawieniaSiatki, fps)
    );
  }

  return undefined;
}

export function przyciagnijCzasDoSiatki(
  czasSekundy: number,
  ustawieniaSiatki: UstawieniaSiatkiTimeline,
  fps?: number
) {
  if (!Number.isFinite(czasSekundy)) {
    return 0;
  }

  const krokSekundy = pobierzKrokSiatkiWSekundach(ustawieniaSiatki, fps);

  if (!krokSekundy || !Number.isFinite(krokSekundy) || krokSekundy <= 0) {
    return Math.max(0, czasSekundy);
  }

  return zaokraglijStabilnie(
    Math.round(czasSekundy / krokSekundy) * krokSekundy
  );
}

export function opiszTrybSiatkiTimeline(
  ustawieniaSiatki: UstawieniaSiatkiTimeline
) {
  return OPISY_SIATKI_TIMELINE[ustawieniaSiatki.jednostka];
}

export type TimelineProjektu = {
  klipy: KlipTimeline[];
  ustawieniaDociagania: UstawieniaDociaganiaTimeline;
  segmentyCiszy: SegmentCiszy[];
  propozycjeCiec: PropozycjaCiecia[];
};

function utworzIdKlipuTimeline(plikMediow: PlikMediow, czasStartuMs: CzasMs) {
  return `klip-${plikMediow.id}-${czasStartuMs}`;
}

function pobierzCzasTrwaniaMedium(plikMediow: PlikMediow): CzasMs {
  return plikMediow.metadane?.czasTrwaniaMs ?? plikMediow.czasTrwaniaMs ?? 0;
}

export function utworzKlipTimelineZDodanegoMedium({
  id,
  plikMediow,
  czasStartuMs = 0,
  czasTrwaniaMs,
  zrodloStartMs = 0,
  zrodloKoniecMs,
  sciezka = "wideo-1",
  nazwa,
  kolor,
  czyZablokowany
}: DaneUtworzeniaKlipuTimeline): KlipTimeline {
  const koniecZrodlaMs =
    zrodloKoniecMs ??
    (plikMediow.typ === "wideo" ? pobierzCzasTrwaniaMedium(plikMediow) : undefined);
  const czasTrwaniaKlipuMs =
    czasTrwaniaMs ??
    (koniecZrodlaMs !== undefined ? koniecZrodlaMs - zrodloStartMs : 0);
  const czasTrwaniaGrafikiMs =
    czasTrwaniaMs ?? DOMYSLNY_CZAS_TRWANIA_GRAFIKI_MS;

  return {
    id: id ?? utworzIdKlipuTimeline(plikMediow, czasStartuMs),
    idPlikuMediow: plikMediow.id,
    rodzaj: plikMediow.typ,
    czasStartuMs,
    czasTrwaniaMs:
      plikMediow.typ === "grafika" ? czasTrwaniaGrafikiMs : czasTrwaniaKlipuMs,
    ...(plikMediow.typ === "wideo" ? { zrodloStartMs, zrodloKoniecMs: koniecZrodlaMs } : {}),
    sciezka,
    nazwa: nazwa ?? plikMediow.nazwaPliku,
    ...(kolor ? { kolor } : {}),
    ...(czyZablokowany !== undefined ? { czyZablokowany } : {})
  };
}

export function utworzKlipTimeline(
  daneKlipu: DaneUtworzeniaKlipuTimeline
): KlipTimeline {
  return utworzKlipTimelineZDodanegoMedium(daneKlipu);
}

export function obliczCzasKoncaKlipu(klip: KlipTimeline): CzasMs {
  return klip.czasStartuMs + klip.czasTrwaniaMs;
}

export function obliczDlugoscTimelineZKlipow(klipy: KlipTimeline[]): CzasMs {
  return klipy.reduce(
    (najpozniejszyKoniecMs, klip) =>
      Math.max(najpozniejszyKoniecMs, obliczCzasKoncaKlipu(klip)),
    0
  );
}

export function posortujKlipyTimeline(klipy: KlipTimeline[]): KlipTimeline[] {
  return [...klipy].sort((pierwszyKlip, drugiKlip) => {
    if (pierwszyKlip.czasStartuMs !== drugiKlip.czasStartuMs) {
      return pierwszyKlip.czasStartuMs - drugiKlip.czasStartuMs;
    }

    return pierwszyKlip.id.localeCompare(drugiKlip.id);
  });
}

export function znajdzKlipTimelinePoId(
  klipy: KlipTimeline[],
  idKlipu: string
): KlipTimeline | undefined {
  return klipy.find((klip) => klip.id === idKlipu);
}

export function walidujKlipTimeline(
  klip: KlipTimeline,
  istniejaceIdPlikowMediow?: string[]
): BladWalidacji[] {
  const bledy: BladWalidacji[] = [];

  if (!klip.id) {
    bledy.push({ pole: "id", komunikat: "Klip musi miec identyfikator." });
  }

  if (!klip.idPlikuMediow) {
    bledy.push({
      pole: "idPlikuMediow",
      komunikat: "Klip musi wskazywac plik mediow."
    });
  } else if (
    istniejaceIdPlikowMediow &&
    !istniejaceIdPlikowMediow.includes(klip.idPlikuMediow)
  ) {
    bledy.push({
      pole: "idPlikuMediow",
      komunikat: "Klip musi wskazywac istniejacy plik mediow projektu."
    });
  }

  if (klip.rodzaj !== "wideo" && klip.rodzaj !== "grafika") {
    bledy.push({
      pole: "rodzaj",
      komunikat: "Rodzaj klipu timeline nie jest obslugiwany."
    });
  }

  if (!Number.isInteger(klip.czasStartuMs) || klip.czasStartuMs < 0) {
    bledy.push({
      pole: "czasStartuMs",
      komunikat: "Czas startu klipu nie moze byc ujemny."
    });
  }

  if (!Number.isInteger(klip.czasTrwaniaMs) || klip.czasTrwaniaMs <= 0) {
    bledy.push({
      pole: "czasTrwaniaMs",
      komunikat: "Czas trwania klipu musi byc wiekszy od zera."
    });
  }

  if (
    klip.zrodloStartMs !== undefined &&
    (!Number.isInteger(klip.zrodloStartMs) || klip.zrodloStartMs < 0)
  ) {
    bledy.push({
      pole: "zrodloStartMs",
      komunikat: "Czas wejscia zrodla nie moze byc ujemny."
    });
  }

  if (
    klip.zrodloKoniecMs !== undefined &&
    (!Number.isInteger(klip.zrodloKoniecMs) || klip.zrodloKoniecMs <= 0)
  ) {
    bledy.push({
      pole: "zrodloKoniecMs",
      komunikat: "Czas wyjscia zrodla musi byc wiekszy od zera."
    });
  }

  if (
    klip.zrodloStartMs !== undefined &&
    klip.zrodloKoniecMs !== undefined &&
    klip.zrodloKoniecMs <= klip.zrodloStartMs
  ) {
    bledy.push({
      pole: "zrodloKoniecMs",
      komunikat: "Czas wyjscia zrodla musi byc po czasie wejscia."
    });
  }

  return bledy;
}

export function czyKlipTimelineJestPoprawny(
  klip: KlipTimeline,
  istniejaceIdPlikowMediow?: string[]
): BladWalidacji[] {
  return walidujKlipTimeline(klip, istniejaceIdPlikowMediow);
}
