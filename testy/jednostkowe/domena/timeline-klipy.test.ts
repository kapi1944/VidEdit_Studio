import { describe, expect, it } from "vitest";
import type { PlikMediow } from "../../../src/domena/media/typyMediow";
import {
  czyKlipTimelineJestPoprawny,
  obliczDlugoscTimelineZKlipow,
  obliczCzasKoncaKlipu,
  posortujKlipyTimeline,
  type RodzajKlipuTimeline,
  utworzKlipTimeline,
  utworzKlipTimelineZDodanegoMedium
} from "../../../src/domena/timeline/typyTimeline";

type PlikMediowKlipu = PlikMediow & { typ: RodzajKlipuTimeline };

function utworzPlikMediow(
  nadpisaneDane: Partial<PlikMediowKlipu> = {}
): PlikMediowKlipu {
  return {
    id: "media-1",
    nazwaPliku: "nagranie.mp4",
    sciezkaPliku: "nagranie.mp4",
    rozszerzenie: ".mp4",
    typMime: "video/mp4",
    rozmiarBajtow: 2048,
    statusImportu: "zaimportowany",
    typ: "wideo",
    czasTrwaniaMs: 12_000,
    ...nadpisaneDane
  };
}

describe("klipy timeline", () => {
  it("tworzy klip z pliku wideo", () => {
    const plikMediow = utworzPlikMediow({
      id: "wideo-1",
      czasTrwaniaMs: 20_000
    });

    const klip = utworzKlipTimelineZDodanegoMedium({
      id: "klip-1",
      plikMediow,
      czasStartuMs: 1_000,
      zrodloStartMs: 2_000,
      zrodloKoniecMs: 8_000
    });

    expect(klip).toMatchObject({
      id: "klip-1",
      idPlikuMediow: "wideo-1",
      rodzaj: "wideo",
      czasStartuMs: 1_000,
      czasTrwaniaMs: 6_000,
      zrodloStartMs: 2_000,
      zrodloKoniecMs: 8_000,
      sciezka: "wideo-1",
      nazwa: "nagranie.mp4"
    });
    expect(czyKlipTimelineJestPoprawny(klip, ["wideo-1"])).toEqual([]);
  });

  it("tworzy klip z grafiki z czasem trwania ustawionym przez uzytkownika", () => {
    const plikMediow = utworzPlikMediow({
      id: "grafika-1",
      nazwaPliku: "plansza.png",
      sciezkaPliku: "plansza.png",
      rozszerzenie: ".png",
      typMime: "image/png",
      typ: "grafika",
      czasTrwaniaMs: undefined
    });

    const klip = utworzKlipTimelineZDodanegoMedium({
      id: "klip-grafika-1",
      plikMediow,
      czasStartuMs: 5_000,
      czasTrwaniaMs: 3_000
    });

    expect(klip).toMatchObject({
      id: "klip-grafika-1",
      idPlikuMediow: "grafika-1",
      rodzaj: "grafika",
      czasStartuMs: 5_000,
      czasTrwaniaMs: 3_000,
      sciezka: "wideo-1",
      nazwa: "plansza.png"
    });
    expect(klip.zrodloStartMs).toBeUndefined();
    expect(klip.zrodloKoniecMs).toBeUndefined();
  });

  it("tworzy klip z grafiki z domyslnym czasem trwania", () => {
    const plikMediow = utworzPlikMediow({
      id: "grafika-1",
      nazwaPliku: "plansza.png",
      sciezkaPliku: "plansza.png",
      rozszerzenie: ".png",
      typMime: "image/png",
      typ: "grafika",
      czasTrwaniaMs: undefined
    });

    const klip = utworzKlipTimeline({
      id: "klip-grafika-1",
      plikMediow
    });

    expect(klip).toMatchObject({
      id: "klip-grafika-1",
      idPlikuMediow: "grafika-1",
      rodzaj: "grafika",
      czasStartuMs: 0,
      czasTrwaniaMs: 5000
    });
    expect(czyKlipTimelineJestPoprawny(klip, ["grafika-1"])).toEqual([]);
  });

  it("oblicza poprawny czas konca klipu", () => {
    const klip = utworzKlipTimelineZDodanegoMedium({
      id: "klip-1",
      plikMediow: utworzPlikMediow(),
      czasStartuMs: 2_500,
      czasTrwaniaMs: 4_000
    });

    expect(obliczCzasKoncaKlipu(klip)).toBe(6_500);
  });

  it("odrzuca ujemny czas startu", () => {
    const klip = utworzKlipTimelineZDodanegoMedium({
      id: "klip-1",
      plikMediow: utworzPlikMediow(),
      czasStartuMs: -1,
      czasTrwaniaMs: 4_000
    });

    expect(czyKlipTimelineJestPoprawny(klip)).toContainEqual({
      pole: "czasStartuMs",
      komunikat: "Czas startu klipu nie moze byc ujemny."
    });
  });

  it("odrzuca zerowy czas trwania", () => {
    const klip = utworzKlipTimelineZDodanegoMedium({
      id: "klip-1",
      plikMediow: utworzPlikMediow(),
      czasStartuMs: 0,
      czasTrwaniaMs: 0
    });

    expect(czyKlipTimelineJestPoprawny(klip)).toContainEqual({
      pole: "czasTrwaniaMs",
      komunikat: "Czas trwania klipu musi byc wiekszy od zera."
    });
  });

  it("odrzuca ujemny czas trwania", () => {
    const klip = utworzKlipTimelineZDodanegoMedium({
      id: "klip-1",
      plikMediow: utworzPlikMediow(),
      czasStartuMs: 0,
      czasTrwaniaMs: -100
    });

    expect(czyKlipTimelineJestPoprawny(klip)).toContainEqual({
      pole: "czasTrwaniaMs",
      komunikat: "Czas trwania klipu musi byc wiekszy od zera."
    });
  });

  it("odrzuca bledny zakres zrodla", () => {
    const klip = utworzKlipTimelineZDodanegoMedium({
      id: "klip-1",
      plikMediow: utworzPlikMediow(),
      czasStartuMs: 0,
      zrodloStartMs: 4000,
      zrodloKoniecMs: 4000
    });

    expect(czyKlipTimelineJestPoprawny(klip)).toContainEqual({
      pole: "czasTrwaniaMs",
      komunikat: "Czas trwania klipu musi byc wiekszy od zera."
    });
    expect(czyKlipTimelineJestPoprawny(klip)).toContainEqual({
      pole: "zrodloKoniecMs",
      komunikat: "Czas wyjscia zrodla musi byc po czasie wejscia."
    });
  });

  it("oblicza zerowa dlugosc timeline bez klipow", () => {
    expect(obliczDlugoscTimelineZKlipow([])).toBe(0);
  });

  it("oblicza dlugosc timeline z jednym klipem", () => {
    const klip = utworzKlipTimelineZDodanegoMedium({
      id: "klip-1",
      plikMediow: utworzPlikMediow(),
      czasStartuMs: 2000,
      czasTrwaniaMs: 4000
    });

    expect(obliczDlugoscTimelineZKlipow([klip])).toBe(6000);
  });

  it("oblicza dlugosc timeline z wielu klipow", () => {
    const pierwszyKlip = utworzKlipTimelineZDodanegoMedium({
      id: "klip-1",
      plikMediow: utworzPlikMediow({ id: "media-1" }),
      czasStartuMs: 2000,
      czasTrwaniaMs: 4000
    });
    const drugiKlip = utworzKlipTimelineZDodanegoMedium({
      id: "klip-2",
      plikMediow: utworzPlikMediow({ id: "media-2" }),
      czasStartuMs: 10_000,
      czasTrwaniaMs: 3000
    });
    const trzeciKlip = utworzKlipTimelineZDodanegoMedium({
      id: "klip-3",
      plikMediow: utworzPlikMediow({ id: "media-3" }),
      czasStartuMs: 500,
      czasTrwaniaMs: 1000
    });

    expect(
      obliczDlugoscTimelineZKlipow([pierwszyKlip, drugiKlip, trzeciKlip])
    ).toBe(13_000);
  });

  it("sortuje klipy po czasie startu", () => {
    const pierwszyKlip = utworzKlipTimelineZDodanegoMedium({
      id: "klip-1",
      plikMediow: utworzPlikMediow({ id: "media-1" }),
      czasStartuMs: 3000,
      czasTrwaniaMs: 1000
    });
    const drugiKlip = utworzKlipTimelineZDodanegoMedium({
      id: "klip-2",
      plikMediow: utworzPlikMediow({ id: "media-2" }),
      czasStartuMs: 1000,
      czasTrwaniaMs: 1000
    });
    const trzeciKlip = utworzKlipTimelineZDodanegoMedium({
      id: "klip-3",
      plikMediow: utworzPlikMediow({ id: "media-3" }),
      czasStartuMs: 2000,
      czasTrwaniaMs: 1000
    });

    expect(posortujKlipyTimeline([pierwszyKlip, drugiKlip, trzeciKlip])).toEqual(
      [drugiKlip, trzeciKlip, pierwszyKlip]
    );
  });

  it("pilnuje, ze klip wskazuje istniejace id pliku mediow projektu", () => {
    const klip = utworzKlipTimelineZDodanegoMedium({
      id: "klip-1",
      plikMediow: utworzPlikMediow({ id: "media-brak" }),
      czasStartuMs: 0,
      czasTrwaniaMs: 4_000
    });

    expect(czyKlipTimelineJestPoprawny(klip, ["media-1"])).toContainEqual({
      pole: "idPlikuMediow",
      komunikat: "Klip musi wskazywac istniejacy plik mediow projektu."
    });
  });
});
