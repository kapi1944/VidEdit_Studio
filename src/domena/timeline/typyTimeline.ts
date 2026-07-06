import type { CzasMs } from "../czas/typyCzasu";
import type { PlikMediow } from "../media/typyMediow";
import type { BladWalidacji } from "../../wspolne/bledy";
import { blad, sukces, type Wynik } from "../../wspolne/wynik";

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
export type RodzajSciezkiTimeline = "wideo" | "obraz" | "audio" | "napisy";

export type SciezkaTimeline = {
  id: string;
  nazwa: string;
  rodzaj: RodzajSciezkiTimeline;
  kolejnosc: number;
  czyWidoczna: boolean;
  czyZablokowana: boolean;
};

export type MarkerTimeline = {
  id: string;
  czasMs: CzasMs;
};

export type TrybEdycjiKlipuMysza =
  | "przesuwanie"
  | "trim-lewy"
  | "trim-prawy";

export type KlipTimeline = {
  id: string;
  idPlikuMediow: string;
  rodzaj: RodzajKlipuTimeline;
  czasStartuMs: CzasMs;
  czasTrwaniaMs: CzasMs;
  zrodloStartMs?: CzasMs;
  zrodloKoniecMs?: CzasMs;
  sciezkaId?: string;
  sciezka?: "wideo-1";
  nazwa: string;
  kolor?: string;
  czyZablokowany?: boolean;
};

export const DOMYSLNY_CZAS_TRWANIA_GRAFIKI_MS = 5000;
export const MINIMALNY_CZAS_TRWANIA_KLIPU_TIMELINE_MS = 100;
export const ID_SCIEZKI_WIDEO_1 = "sciezka-wideo-1";
export const ID_SCIEZKI_OBRAZY = "sciezka-obrazy";
export const ID_SCIEZKI_AUDIO_1 = "sciezka-audio-1";

export const DOMYSLNE_SCIEZKI_TIMELINE: SciezkaTimeline[] = [
  {
    id: ID_SCIEZKI_WIDEO_1,
    nazwa: "Wideo 1",
    rodzaj: "wideo",
    kolejnosc: 1,
    czyWidoczna: true,
    czyZablokowana: false
  },
  {
    id: ID_SCIEZKI_OBRAZY,
    nazwa: "Obrazy",
    rodzaj: "obraz",
    kolejnosc: 2,
    czyWidoczna: true,
    czyZablokowana: false
  },
  {
    id: ID_SCIEZKI_AUDIO_1,
    nazwa: "Audio 1",
    rodzaj: "audio",
    kolejnosc: 3,
    czyWidoczna: true,
    czyZablokowana: false
  }
];

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
  sciezkaId?: string;
  sciezka?: "wideo-1";
  nazwa?: string;
  kolor?: string;
  czyZablokowany?: boolean;
};

export type StanEdycjiKlipuMysza = {
  klipPoczatkowy: KlipTimeline;
  pozycjaStartowaMyszyX: number;
  szerokoscTimelinePx: number;
  czasTrwaniaTimelineMs: CzasMs;
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

export function pobierzKrokEdycjiTimeline(
  ustawieniaSiatki?: UstawieniaSiatkiTimeline,
  fps?: number
) {
  if (!ustawieniaSiatki) {
    return 0.5;
  }

  return pobierzKrokSiatkiWSekundach(ustawieniaSiatki, fps) ?? 0.5;
}

export type TimelineProjektu = {
  sciezki: SciezkaTimeline[];
  klipy: KlipTimeline[];
  markery: MarkerTimeline[];
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

export function pobierzDomyslnaSciezkeIdDlaRodzaju(
  rodzajKlipu: RodzajKlipuTimeline
) {
  return rodzajKlipu === "grafika" ? ID_SCIEZKI_OBRAZY : ID_SCIEZKI_WIDEO_1;
}

export function pobierzSciezkaIdKlipuTimeline(klip: KlipTimeline) {
  if (klip.sciezkaId && klip.sciezkaId.trim().length > 0) {
    return klip.sciezkaId;
  }

  if (klip.sciezka === "wideo-1") {
    return ID_SCIEZKI_WIDEO_1;
  }

  return pobierzDomyslnaSciezkeIdDlaRodzaju(klip.rodzaj);
}

export function pobierzSciezkiTimelineZFallbackiem(
  sciezki?: SciezkaTimeline[]
) {
  return Array.isArray(sciezki) && sciezki.length > 0
    ? sciezki
    : DOMYSLNE_SCIEZKI_TIMELINE;
}

export function utworzKlipTimelineZDodanegoMedium({
  id,
  plikMediow,
  czasStartuMs = 0,
  czasTrwaniaMs,
  zrodloStartMs = 0,
  zrodloKoniecMs,
  sciezkaId,
  sciezka,
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
    sciezkaId:
      sciezkaId ??
      (sciezka === "wideo-1"
        ? ID_SCIEZKI_WIDEO_1
        : pobierzDomyslnaSciezkeIdDlaRodzaju(plikMediow.typ)),
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

function utworzIdCzesciKlipuTimeline(
  klip: KlipTimeline,
  czasCieciaMs: CzasMs,
  numerCzesci: number
) {
  return `${klip.id}-czesc-${numerCzesci}-${czasCieciaMs}`;
}

function utworzNazweCzesciKlipu(klip: KlipTimeline, numerCzesci: number) {
  return `${klip.nazwa} ${numerCzesci}`;
}

function utworzCzesciKlipuTimeline(
  klip: KlipTimeline,
  czasCieciaMs: CzasMs
): [KlipTimeline, KlipTimeline] {
  const czasKoncaKlipuMs = obliczCzasKoncaKlipu(klip);
  const czasTrwaniaPierwszejCzesciMs = czasCieciaMs - klip.czasStartuMs;
  const czasTrwaniaDrugiejCzesciMs = czasKoncaKlipuMs - czasCieciaMs;
  const pierwszaCzesc: KlipTimeline = {
    ...klip,
    id: utworzIdCzesciKlipuTimeline(klip, czasCieciaMs, 1),
    nazwa: utworzNazweCzesciKlipu(klip, 1),
    czasTrwaniaMs: czasTrwaniaPierwszejCzesciMs
  };
  const drugaCzesc: KlipTimeline = {
    ...klip,
    id: utworzIdCzesciKlipuTimeline(klip, czasCieciaMs, 2),
    nazwa: utworzNazweCzesciKlipu(klip, 2),
    czasStartuMs: czasCieciaMs,
    czasTrwaniaMs: czasTrwaniaDrugiejCzesciMs
  };

  if (klip.rodzaj === "wideo") {
    const zrodloStartMs = klip.zrodloStartMs ?? 0;
    const zrodloCieciaMs = zrodloStartMs + czasTrwaniaPierwszejCzesciMs;
    const zrodloKoniecMs = klip.zrodloKoniecMs ?? zrodloStartMs + klip.czasTrwaniaMs;

    pierwszaCzesc.zrodloStartMs = zrodloStartMs;
    pierwszaCzesc.zrodloKoniecMs = zrodloCieciaMs;
    drugaCzesc.zrodloStartMs = zrodloCieciaMs;
    drugaCzesc.zrodloKoniecMs = zrodloKoniecMs;
  } else {
    delete pierwszaCzesc.zrodloStartMs;
    delete pierwszaCzesc.zrodloKoniecMs;
    delete drugaCzesc.zrodloStartMs;
    delete drugaCzesc.zrodloKoniecMs;
  }

  return [pierwszaCzesc, drugaCzesc];
}

function utworzBladCieciaKlipu(
  pole: string,
  komunikat: string
): Wynik<KlipTimeline[], BladWalidacji> {
  return blad({ pole, komunikat });
}

function utworzBladEdycjiKlipu(
  pole: string,
  komunikat: string
): Wynik<KlipTimeline[], BladWalidacji> {
  return blad({ pole, komunikat });
}

function utworzBladMarkeraTimeline(
  pole: string,
  komunikat: string
): Wynik<MarkerTimeline[], BladWalidacji> {
  return blad({ pole, komunikat });
}

function znajdzIndeksKlipuAlboBlad(
  klipy: KlipTimeline[],
  idKlipu: string
): Wynik<number, BladWalidacji> {
  const indeksKlipu = klipy.findIndex((klip) => klip.id === idKlipu);

  if (indeksKlipu < 0) {
    return blad({
      pole: "idKlipu",
      komunikat: "Nie znaleziono klipu timeline."
    });
  }

  return sukces(indeksKlipu);
}

function przeliczCzasEdycjiNaMs(
  czasSekundy: number,
  ustawieniaSiatkiTimeline?: UstawieniaSiatkiTimeline,
  fps?: number
) {
  if (!Number.isFinite(czasSekundy)) {
    return undefined;
  }

  const czasPoSiatceSekundy = ustawieniaSiatkiTimeline
    ? przyciagnijCzasDoSiatki(czasSekundy, ustawieniaSiatkiTimeline, fps)
    : czasSekundy;

  return Math.max(0, Math.round(czasPoSiatceSekundy * 1000));
}

function ograniczLiczbe(
  wartosc: number,
  wartoscMinimalna: number,
  wartoscMaksymalna: number
) {
  return Math.min(Math.max(wartosc, wartoscMinimalna), wartoscMaksymalna);
}

function przeliczPrzesuniecieMyszyNaMs(
  stanEdycji: StanEdycjiKlipuMysza,
  pozycjaMyszyX: number
) {
  if (
    stanEdycji.szerokoscTimelinePx <= 0 ||
    stanEdycji.czasTrwaniaTimelineMs <= 0
  ) {
    return 0;
  }

  return (
    ((pozycjaMyszyX - stanEdycji.pozycjaStartowaMyszyX) /
      stanEdycji.szerokoscTimelinePx) *
    stanEdycji.czasTrwaniaTimelineMs
  );
}

function przeliczCzasMsZSiatka(
  czasMs: CzasMs,
  ustawieniaSiatkiTimeline?: UstawieniaSiatkiTimeline,
  fps?: number
) {
  return (
    przeliczCzasEdycjiNaMs(czasMs / 1000, ustawieniaSiatkiTimeline, fps) ?? 0
  );
}

function zaktualizujKlipWTablicy(
  klipy: KlipTimeline[],
  indeksKlipu: number,
  klipPoZmianie: KlipTimeline
) {
  return [
    ...klipy.slice(0, indeksKlipu),
    klipPoZmianie,
    ...klipy.slice(indeksKlipu + 1)
  ];
}

function utworzIdMarkeraTimeline(czasMs: CzasMs) {
  return `marker-${czasMs}`;
}

export function posortujMarkeryTimeline(
  markery: MarkerTimeline[]
): MarkerTimeline[] {
  return [...markery].sort((pierwszyMarker, drugiMarker) => {
    if (pierwszyMarker.czasMs !== drugiMarker.czasMs) {
      return pierwszyMarker.czasMs - drugiMarker.czasMs;
    }

    return pierwszyMarker.id.localeCompare(drugiMarker.id);
  });
}

export function dodajMarkerTimeline(
  markery: MarkerTimeline[],
  czasSekundy: number,
  ustawieniaSiatkiTimeline?: UstawieniaSiatkiTimeline,
  fps?: number
): Wynik<MarkerTimeline[], BladWalidacji> {
  const czasMs = przeliczCzasEdycjiNaMs(
    czasSekundy,
    ustawieniaSiatkiTimeline,
    fps
  );

  if (czasMs === undefined) {
    return utworzBladMarkeraTimeline(
      "czas",
      "Czas markera musi byc poprawna liczba."
    );
  }

  if (markery.some((marker) => marker.czasMs === czasMs)) {
    return utworzBladMarkeraTimeline(
      "czas",
      "Marker w tym miejscu juz istnieje."
    );
  }

  return sukces(
    posortujMarkeryTimeline([
      ...markery,
      {
        id: utworzIdMarkeraTimeline(czasMs),
        czasMs
      }
    ])
  );
}

export function usunMarkerTimeline(
  markery: MarkerTimeline[],
  idMarkera: string
): Wynik<MarkerTimeline[], BladWalidacji> {
  if (!markery.some((marker) => marker.id === idMarkera)) {
    return utworzBladMarkeraTimeline(
      "idMarkera",
      "Nie znaleziono markera timeline."
    );
  }

  return sukces(markery.filter((marker) => marker.id !== idMarkera));
}

export function przesunMarkerTimeline(
  markery: MarkerTimeline[],
  idMarkera: string,
  nowyCzasSekundy: number,
  ustawieniaSiatkiTimeline?: UstawieniaSiatkiTimeline,
  fps?: number
): Wynik<MarkerTimeline[], BladWalidacji> {
  const indeksMarkera = markery.findIndex((marker) => marker.id === idMarkera);

  if (indeksMarkera < 0) {
    return utworzBladMarkeraTimeline(
      "idMarkera",
      "Nie znaleziono markera timeline."
    );
  }

  const czasMs = przeliczCzasEdycjiNaMs(
    nowyCzasSekundy,
    ustawieniaSiatkiTimeline,
    fps
  );

  if (czasMs === undefined) {
    return utworzBladMarkeraTimeline(
      "czas",
      "Czas markera musi byc poprawna liczba."
    );
  }

  if (
    markery.some(
      (marker) => marker.id !== idMarkera && marker.czasMs === czasMs
    )
  ) {
    return utworzBladMarkeraTimeline(
      "czas",
      "Marker w tym miejscu juz istnieje."
    );
  }

  return sukces(
    posortujMarkeryTimeline([
      ...markery.slice(0, indeksMarkera),
      { ...markery[indeksMarkera], czasMs },
      ...markery.slice(indeksMarkera + 1)
    ])
  );
}

export function rozpocznijPrzesuwanieKlipu(
  klipPoczatkowy: KlipTimeline,
  pozycjaStartowaMyszyX: number,
  szerokoscTimelinePx: number,
  czasTrwaniaTimelineMs: CzasMs
): StanEdycjiKlipuMysza {
  return {
    klipPoczatkowy,
    pozycjaStartowaMyszyX,
    szerokoscTimelinePx,
    czasTrwaniaTimelineMs
  };
}

export function ograniczKlipDoZrodla(
  klip: KlipTimeline,
  minimalnyCzasTrwaniaMs: CzasMs = MINIMALNY_CZAS_TRWANIA_KLIPU_TIMELINE_MS
): KlipTimeline {
  const czasTrwaniaMs = Math.max(minimalnyCzasTrwaniaMs, klip.czasTrwaniaMs);
  const klipPoOgraniczeniu: KlipTimeline = {
    ...klip,
    czasTrwaniaMs
  };

  if (klip.rodzaj !== "wideo") {
    delete klipPoOgraniczeniu.zrodloStartMs;
    delete klipPoOgraniczeniu.zrodloKoniecMs;
    return klipPoOgraniczeniu;
  }

  const zrodloStartMs = Math.max(0, klip.zrodloStartMs ?? 0);
  const zrodloKoniecMs = Math.max(
    zrodloStartMs + minimalnyCzasTrwaniaMs,
    klip.zrodloKoniecMs ?? zrodloStartMs + czasTrwaniaMs
  );
  const dostepnyCzasZrodlaMs = zrodloKoniecMs - zrodloStartMs;
  const ograniczonyCzasTrwaniaMs = Math.min(
    czasTrwaniaMs,
    dostepnyCzasZrodlaMs
  );

  return {
    ...klipPoOgraniczeniu,
    czasTrwaniaMs: ograniczonyCzasTrwaniaMs,
    zrodloStartMs,
    zrodloKoniecMs: zrodloStartMs + ograniczonyCzasTrwaniaMs
  };
}

export function przeliczPrzesuniecieKlipuMysza(
  stanEdycji: StanEdycjiKlipuMysza,
  pozycjaMyszyX: number,
  ustawieniaSiatkiTimeline?: UstawieniaSiatkiTimeline,
  fps?: number
): KlipTimeline {
  const przesuniecieMs = przeliczPrzesuniecieMyszyNaMs(
    stanEdycji,
    pozycjaMyszyX
  );
  const nowyCzasStartuMs = przeliczCzasMsZSiatka(
    stanEdycji.klipPoczatkowy.czasStartuMs + przesuniecieMs,
    ustawieniaSiatkiTimeline,
    fps
  );

  return {
    ...stanEdycji.klipPoczatkowy,
    czasStartuMs: Math.max(0, nowyCzasStartuMs)
  };
}

export function przeliczTrimLewejKrawedzi(
  stanEdycji: StanEdycjiKlipuMysza,
  pozycjaMyszyX: number,
  ustawieniaSiatkiTimeline?: UstawieniaSiatkiTimeline,
  fps?: number,
  minimalnyCzasTrwaniaMs: CzasMs = MINIMALNY_CZAS_TRWANIA_KLIPU_TIMELINE_MS
): KlipTimeline {
  const klip = stanEdycji.klipPoczatkowy;
  const czasKoncaKlipuMs = obliczCzasKoncaKlipu(klip);
  const przesuniecieMs = przeliczPrzesuniecieMyszyNaMs(
    stanEdycji,
    pozycjaMyszyX
  );
  const czasStartuPoSiatceMs = przeliczCzasMsZSiatka(
    klip.czasStartuMs + przesuniecieMs,
    ustawieniaSiatkiTimeline,
    fps
  );
  const najpozniejszyStartMs = Math.max(
    klip.czasStartuMs,
    czasKoncaKlipuMs - minimalnyCzasTrwaniaMs
  );
  const nowyCzasStartuMs = ograniczLiczbe(
    czasStartuPoSiatceMs,
    klip.czasStartuMs,
    najpozniejszyStartMs
  );
  const przesunieciePoczatkuMs = nowyCzasStartuMs - klip.czasStartuMs;
  const klipPoTrimie: KlipTimeline = {
    ...klip,
    czasStartuMs: nowyCzasStartuMs,
    czasTrwaniaMs: czasKoncaKlipuMs - nowyCzasStartuMs
  };

  if (klip.rodzaj === "wideo") {
    klipPoTrimie.zrodloStartMs =
      (klip.zrodloStartMs ?? 0) + przesunieciePoczatkuMs;
  }

  return ograniczKlipDoZrodla(klipPoTrimie, minimalnyCzasTrwaniaMs);
}

export function przeliczTrimPrawejKrawedzi(
  stanEdycji: StanEdycjiKlipuMysza,
  pozycjaMyszyX: number,
  ustawieniaSiatkiTimeline?: UstawieniaSiatkiTimeline,
  fps?: number,
  minimalnyCzasTrwaniaMs: CzasMs = MINIMALNY_CZAS_TRWANIA_KLIPU_TIMELINE_MS
): KlipTimeline {
  const klip = stanEdycji.klipPoczatkowy;
  const czasKoncaKlipuMs = obliczCzasKoncaKlipu(klip);
  const przesuniecieMs = przeliczPrzesuniecieMyszyNaMs(
    stanEdycji,
    pozycjaMyszyX
  );
  const czasKoncaPoSiatceMs = przeliczCzasMsZSiatka(
    czasKoncaKlipuMs + przesuniecieMs,
    ustawieniaSiatkiTimeline,
    fps
  );
  const najwczesniejszyKoniecMs = Math.min(
    czasKoncaKlipuMs,
    klip.czasStartuMs + minimalnyCzasTrwaniaMs
  );
  const nowyCzasKoncaMs = ograniczLiczbe(
    czasKoncaPoSiatceMs,
    najwczesniejszyKoniecMs,
    czasKoncaKlipuMs
  );
  const klipPoTrimie: KlipTimeline = {
    ...klip,
    czasTrwaniaMs: nowyCzasKoncaMs - klip.czasStartuMs
  };

  if (klip.rodzaj === "wideo") {
    klipPoTrimie.zrodloKoniecMs =
      (klip.zrodloStartMs ?? 0) + klipPoTrimie.czasTrwaniaMs;
  }

  return ograniczKlipDoZrodla(klipPoTrimie, minimalnyCzasTrwaniaMs);
}

export function przetnijKlipTimeline(
  klipy: KlipTimeline[],
  idKlipu: string,
  czasCieciaSekundy: number,
  ustawieniaSiatkiTimeline?: UstawieniaSiatkiTimeline,
  fps?: number
): Wynik<KlipTimeline[], BladWalidacji> {
  if (!Number.isFinite(czasCieciaSekundy)) {
    return utworzBladCieciaKlipu(
      "czasCiecia",
      "Czas ciecia musi byc poprawna liczba."
    );
  }

  const indeksKlipu = klipy.findIndex((klip) => klip.id === idKlipu);

  if (indeksKlipu < 0) {
    return utworzBladCieciaKlipu("idKlipu", "Nie znaleziono klipu timeline.");
  }

  const klip = klipy[indeksKlipu];
  const czasPoSiatceSekundy = ustawieniaSiatkiTimeline
    ? przyciagnijCzasDoSiatki(
        czasCieciaSekundy,
        ustawieniaSiatkiTimeline,
        fps
      )
    : czasCieciaSekundy;
  const czasCieciaMs = Math.round(czasPoSiatceSekundy * 1000);
  const czasKoncaKlipuMs = obliczCzasKoncaKlipu(klip);

  if (czasCieciaMs < klip.czasStartuMs) {
    return utworzBladCieciaKlipu(
      "czasCiecia",
      "Czas ciecia jest przed klipem."
    );
  }

  if (czasCieciaMs === klip.czasStartuMs) {
    return utworzBladCieciaKlipu(
      "czasCiecia",
      "Nie mozna przeciac klipu na poczatku."
    );
  }

  if (czasCieciaMs === czasKoncaKlipuMs) {
    return utworzBladCieciaKlipu(
      "czasCiecia",
      "Nie mozna przeciac klipu na koncu."
    );
  }

  if (czasCieciaMs > czasKoncaKlipuMs) {
    return utworzBladCieciaKlipu(
      "czasCiecia",
      "Czas ciecia jest po klipie."
    );
  }

  const [pierwszaCzesc, drugaCzesc] = utworzCzesciKlipuTimeline(
    klip,
    czasCieciaMs
  );

  return sukces([
    ...klipy.slice(0, indeksKlipu),
    pierwszaCzesc,
    drugaCzesc,
    ...klipy.slice(indeksKlipu + 1)
  ]);
}

export function przesunKlipTimeline(
  klipy: KlipTimeline[],
  idKlipu: string,
  nowyCzasStartuSekundy: number,
  ustawieniaSiatkiTimeline?: UstawieniaSiatkiTimeline,
  fps?: number
): Wynik<KlipTimeline[], BladWalidacji> {
  const wynikIndeksu = znajdzIndeksKlipuAlboBlad(klipy, idKlipu);

  if (!wynikIndeksu.czySukces) {
    return wynikIndeksu;
  }

  const nowyCzasStartuMs = przeliczCzasEdycjiNaMs(
    nowyCzasStartuSekundy,
    ustawieniaSiatkiTimeline,
    fps
  );

  if (nowyCzasStartuMs === undefined) {
    return utworzBladEdycjiKlipu(
      "czasStartu",
      "Czas startu musi byc poprawna liczba."
    );
  }

  const klip = klipy[wynikIndeksu.dane];

  return sukces(
    zaktualizujKlipWTablicy(klipy, wynikIndeksu.dane, {
      ...klip,
      czasStartuMs: nowyCzasStartuMs
    })
  );
}

export function skrocPoczatekKlipuTimeline(
  klipy: KlipTimeline[],
  idKlipu: string,
  nowyCzasStartuSekundy: number,
  ustawieniaSiatkiTimeline?: UstawieniaSiatkiTimeline,
  fps?: number
): Wynik<KlipTimeline[], BladWalidacji> {
  const wynikIndeksu = znajdzIndeksKlipuAlboBlad(klipy, idKlipu);

  if (!wynikIndeksu.czySukces) {
    return wynikIndeksu;
  }

  const nowyCzasStartuMs = przeliczCzasEdycjiNaMs(
    nowyCzasStartuSekundy,
    ustawieniaSiatkiTimeline,
    fps
  );

  if (nowyCzasStartuMs === undefined) {
    return utworzBladEdycjiKlipu(
      "czasStartu",
      "Czas startu musi byc poprawna liczba."
    );
  }

  const klip = klipy[wynikIndeksu.dane];
  const czasKoncaKlipuMs = obliczCzasKoncaKlipu(klip);

  if (nowyCzasStartuMs <= klip.czasStartuMs) {
    return utworzBladEdycjiKlipu(
      "czasStartu",
      "Nowy poczatek musi byc po obecnym poczatku klipu."
    );
  }

  if (nowyCzasStartuMs >= czasKoncaKlipuMs) {
    return utworzBladEdycjiKlipu(
      "czasStartu",
      "Skrocenie poczatku nie moze wyzerowac klipu."
    );
  }

  const przesunieciePoczatkuMs = nowyCzasStartuMs - klip.czasStartuMs;
  const klipPoZmianie: KlipTimeline = {
    ...klip,
    czasStartuMs: nowyCzasStartuMs,
    czasTrwaniaMs: czasKoncaKlipuMs - nowyCzasStartuMs
  };

  if (klip.rodzaj === "wideo") {
    klipPoZmianie.zrodloStartMs =
      (klip.zrodloStartMs ?? 0) + przesunieciePoczatkuMs;
  } else {
    delete klipPoZmianie.zrodloStartMs;
    delete klipPoZmianie.zrodloKoniecMs;
  }

  return sukces(
    zaktualizujKlipWTablicy(klipy, wynikIndeksu.dane, klipPoZmianie)
  );
}

export function skrocKoniecKlipuTimeline(
  klipy: KlipTimeline[],
  idKlipu: string,
  nowyCzasKoncaSekundy: number,
  ustawieniaSiatkiTimeline?: UstawieniaSiatkiTimeline,
  fps?: number
): Wynik<KlipTimeline[], BladWalidacji> {
  const wynikIndeksu = znajdzIndeksKlipuAlboBlad(klipy, idKlipu);

  if (!wynikIndeksu.czySukces) {
    return wynikIndeksu;
  }

  const nowyCzasKoncaMs = przeliczCzasEdycjiNaMs(
    nowyCzasKoncaSekundy,
    ustawieniaSiatkiTimeline,
    fps
  );

  if (nowyCzasKoncaMs === undefined) {
    return utworzBladEdycjiKlipu(
      "czasKonca",
      "Czas konca musi byc poprawna liczba."
    );
  }

  const klip = klipy[wynikIndeksu.dane];
  const obecnyCzasKoncaMs = obliczCzasKoncaKlipu(klip);

  if (nowyCzasKoncaMs >= obecnyCzasKoncaMs) {
    return utworzBladEdycjiKlipu(
      "czasKonca",
      "Nowy koniec musi byc przed obecnym koncem klipu."
    );
  }

  if (nowyCzasKoncaMs <= klip.czasStartuMs) {
    return utworzBladEdycjiKlipu(
      "czasKonca",
      "Skrocenie konca nie moze wyzerowac klipu."
    );
  }

  const nowyCzasTrwaniaMs = nowyCzasKoncaMs - klip.czasStartuMs;
  const klipPoZmianie: KlipTimeline = {
    ...klip,
    czasTrwaniaMs: nowyCzasTrwaniaMs
  };

  if (klip.rodzaj === "wideo") {
    klipPoZmianie.zrodloKoniecMs =
      (klip.zrodloStartMs ?? 0) + nowyCzasTrwaniaMs;
  } else {
    delete klipPoZmianie.zrodloStartMs;
    delete klipPoZmianie.zrodloKoniecMs;
  }

  return sukces(
    zaktualizujKlipWTablicy(klipy, wynikIndeksu.dane, klipPoZmianie)
  );
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
  istniejaceIdPlikowMediow?: string[],
  istniejaceSciezkiTimeline?: SciezkaTimeline[]
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

  const sciezkaId = pobierzSciezkaIdKlipuTimeline(klip);

  if (istniejaceSciezkiTimeline) {
    const czySciezkaIstnieje = istniejaceSciezkiTimeline.some(
      (sciezkaTimeline) => sciezkaTimeline.id === sciezkaId
    );

    if (!czySciezkaIstnieje) {
      bledy.push({
        pole: "sciezkaId",
        komunikat: "Klip musi wskazywac istniejaca sciezke timeline."
      });
    }
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

export function walidujSciezkeTimeline(
  sciezka: SciezkaTimeline
): BladWalidacji[] {
  const bledy: BladWalidacji[] = [];

  if (!sciezka.id) {
    bledy.push({ pole: "id", komunikat: "Sciezka musi miec identyfikator." });
  }

  if (sciezka.nazwa.trim().length === 0) {
    bledy.push({ pole: "nazwa", komunikat: "Sciezka musi miec nazwe." });
  }

  if (
    sciezka.rodzaj !== "wideo" &&
    sciezka.rodzaj !== "obraz" &&
    sciezka.rodzaj !== "audio" &&
    sciezka.rodzaj !== "napisy"
  ) {
    bledy.push({
      pole: "rodzaj",
      komunikat: "Rodzaj sciezki timeline nie jest obslugiwany."
    });
  }

  if (!Number.isInteger(sciezka.kolejnosc) || sciezka.kolejnosc < 0) {
    bledy.push({
      pole: "kolejnosc",
      komunikat: "Kolejnosc sciezki musi byc liczba nieujemna."
    });
  }

  if (typeof sciezka.czyWidoczna !== "boolean") {
    bledy.push({
      pole: "czyWidoczna",
      komunikat: "Sciezka musi okreslac widocznosc."
    });
  }

  if (typeof sciezka.czyZablokowana !== "boolean") {
    bledy.push({
      pole: "czyZablokowana",
      komunikat: "Sciezka musi okreslac blokade."
    });
  }

  return bledy;
}

export function walidujMarkerTimeline(marker: MarkerTimeline): BladWalidacji[] {
  const bledy: BladWalidacji[] = [];

  if (!marker.id) {
    bledy.push({ pole: "id", komunikat: "Marker musi miec identyfikator." });
  }

  if (!Number.isInteger(marker.czasMs) || marker.czasMs < 0) {
    bledy.push({
      pole: "czasMs",
      komunikat: "Czas markera nie moze byc ujemny."
    });
  }

  return bledy;
}

export function czyKlipTimelineJestPoprawny(
  klip: KlipTimeline,
  istniejaceIdPlikowMediow?: string[],
  istniejaceSciezkiTimeline?: SciezkaTimeline[]
): BladWalidacji[] {
  return walidujKlipTimeline(
    klip,
    istniejaceIdPlikowMediow,
    istniejaceSciezkiTimeline
  );
}
