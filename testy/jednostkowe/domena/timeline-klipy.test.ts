import { describe, expect, it } from "vitest";
import type { PlikMediow } from "../../../src/domena/media/typyMediow";
import {
  czyKlipTimelineJestPoprawny,
  obliczCzasKoncaKlipu,
  type RodzajKlipuTimeline,
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
