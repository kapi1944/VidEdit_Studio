import { describe, expect, it } from "vitest";

import {
  przesunKlipTimeline,
  skrocKoniecKlipuTimeline,
  skrocPoczatekKlipuTimeline,
  USTAWIENIA_DOCIAGANIA_TIMELINE_MVP,
  type JednostkaDociaganiaTimeline,
  type KlipTimeline,
  type UstawieniaSiatkiTimeline
} from "../../../src/domena/timeline/typyTimeline";

const klipWideo: KlipTimeline = {
  id: "klip-1",
  idPlikuMediow: "media-1",
  rodzaj: "wideo",
  czasStartuMs: 1000,
  czasTrwaniaMs: 8000,
  zrodloStartMs: 2000,
  zrodloKoniecMs: 10000,
  sciezka: "wideo-1",
  nazwa: "Lekcja"
};

const drugiKlip: KlipTimeline = {
  id: "klip-2",
  idPlikuMediow: "media-2",
  rodzaj: "wideo",
  czasStartuMs: 12000,
  czasTrwaniaMs: 3000,
  zrodloStartMs: 0,
  zrodloKoniecMs: 3000,
  sciezka: "wideo-1",
  nazwa: "Outro"
};

const klipGrafiki: KlipTimeline = {
  id: "grafika-1",
  idPlikuMediow: "media-grafika-1",
  rodzaj: "grafika",
  czasStartuMs: 0,
  czasTrwaniaMs: 5000,
  sciezka: "wideo-1",
  nazwa: "Plansza"
};

function pobierzUstawieniaSiatki(
  jednostka: JednostkaDociaganiaTimeline
): UstawieniaSiatkiTimeline {
  const ustawienia = USTAWIENIA_DOCIAGANIA_TIMELINE_MVP.find(
    (ustawieniaSiatki) => ustawieniaSiatki.jednostka === jednostka
  );

  if (!ustawienia) {
    throw new Error(`Brak ustawien siatki: ${jednostka}`);
  }

  return ustawienia;
}

function pobierzKlipyZWyniku(
  wynik: ReturnType<typeof przesunKlipTimeline>
) {
  if (!wynik.czySukces) {
    throw new Error("Oczekiwano poprawnej edycji klipu.");
  }

  return wynik.dane;
}

describe("edycja klipu timeline", () => {
  it("przesuwa klip w prawo", () => {
    const klipy = pobierzKlipyZWyniku(
      przesunKlipTimeline([klipWideo], "klip-1", 2.5)
    );

    expect(klipy[0]).toMatchObject({
      czasStartuMs: 2500,
      czasTrwaniaMs: 8000,
      zrodloStartMs: 2000,
      zrodloKoniecMs: 10000
    });
  });

  it("przesuwa klip w lewo", () => {
    const klipy = pobierzKlipyZWyniku(
      przesunKlipTimeline([klipWideo], "klip-1", 0.5)
    );

    expect(klipy[0]?.czasStartuMs).toBe(500);
  });

  it("zabezpiecza przesuniecie przed czasem ujemnym", () => {
    const klipy = pobierzKlipyZWyniku(
      przesunKlipTimeline([klipWideo], "klip-1", -2)
    );

    expect(klipy[0]?.czasStartuMs).toBe(0);
  });

  it("przesuwa klip z aktywnym snapem", () => {
    const klipy = pobierzKlipyZWyniku(
      przesunKlipTimeline(
        [klipWideo],
        "klip-1",
        2.4,
        pobierzUstawieniaSiatki("sekunda")
      )
    );

    expect(klipy[0]?.czasStartuMs).toBe(2000);
  });

  it("skraca poczatek klipu wideo", () => {
    const klipy = pobierzKlipyZWyniku(
      skrocPoczatekKlipuTimeline([klipWideo], "klip-1", 3)
    );

    expect(klipy[0]).toMatchObject({
      czasStartuMs: 3000,
      czasTrwaniaMs: 6000,
      zrodloStartMs: 4000,
      zrodloKoniecMs: 10000
    });
  });

  it("skraca koniec klipu wideo", () => {
    const klipy = pobierzKlipyZWyniku(
      skrocKoniecKlipuTimeline([klipWideo], "klip-1", 7)
    );

    expect(klipy[0]).toMatchObject({
      czasStartuMs: 1000,
      czasTrwaniaMs: 6000,
      zrodloStartMs: 2000,
      zrodloKoniecMs: 8000
    });
  });

  it("skraca poczatek grafiki", () => {
    const klipy = pobierzKlipyZWyniku(
      skrocPoczatekKlipuTimeline([klipGrafiki], "grafika-1", 1)
    );

    expect(klipy[0]).toMatchObject({
      czasStartuMs: 1000,
      czasTrwaniaMs: 4000
    });
    expect(klipy[0]?.zrodloStartMs).toBeUndefined();
  });

  it("skraca koniec grafiki", () => {
    const klipy = pobierzKlipyZWyniku(
      skrocKoniecKlipuTimeline([klipGrafiki], "grafika-1", 4)
    );

    expect(klipy[0]).toMatchObject({
      czasStartuMs: 0,
      czasTrwaniaMs: 4000
    });
    expect(klipy[0]?.zrodloKoniecMs).toBeUndefined();
  });

  it("zwraca blad przy probie skrocenia do zera", () => {
    expect(skrocKoniecKlipuTimeline([klipGrafiki], "grafika-1", 0)).toEqual({
      czySukces: false,
      bledy: [
        {
          pole: "czasKonca",
          komunikat: "Skrocenie konca nie moze wyzerowac klipu."
        }
      ]
    });
  });

  it("zwraca blad przy probie skrocenia ponizej zera", () => {
    expect(skrocPoczatekKlipuTimeline([klipGrafiki], "grafika-1", 6)).toEqual({
      czySukces: false,
      bledy: [
        {
          pole: "czasStartu",
          komunikat: "Skrocenie poczatku nie moze wyzerowac klipu."
        }
      ]
    });
  });

  it("nie zmienia innych klipow", () => {
    const klipy = pobierzKlipyZWyniku(
      przesunKlipTimeline([klipWideo, drugiKlip], "klip-1", 2)
    );

    expect(klipy[1]).toBe(drugiKlip);
  });

  it("nie zmienia id medium", () => {
    const klipy = pobierzKlipyZWyniku(
      skrocKoniecKlipuTimeline([klipWideo], "klip-1", 7)
    );

    expect(klipy[0]?.idPlikuMediow).toBe("media-1");
  });
});
