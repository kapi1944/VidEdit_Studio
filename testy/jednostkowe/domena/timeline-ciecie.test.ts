import { describe, expect, it } from "vitest";

import {
  przetnijKlipTimeline,
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
  wynik: ReturnType<typeof przetnijKlipTimeline>
) {
  if (!wynik.czySukces) {
    throw new Error("Oczekiwano poprawnego ciecia klipu.");
  }

  return wynik.dane;
}

describe("ciecie klipu timeline", () => {
  it("przecina jeden klip w srodku", () => {
    const klipy = pobierzKlipyZWyniku(
      przetnijKlipTimeline([klipWideo], "klip-1", 4)
    );

    expect(klipy).toHaveLength(2);
    expect(klipy[0]).toMatchObject({
      idPlikuMediow: "media-1",
      rodzaj: "wideo",
      czasStartuMs: 1000,
      czasTrwaniaMs: 3000
    });
    expect(klipy[1]).toMatchObject({
      idPlikuMediow: "media-1",
      rodzaj: "wideo",
      czasStartuMs: 4000,
      czasTrwaniaMs: 5000
    });
  });

  it("przecina z dociaganiem do 1 s", () => {
    const klipy = pobierzKlipyZWyniku(
      przetnijKlipTimeline(
        [klipWideo],
        "klip-1",
        4.4,
        pobierzUstawieniaSiatki("sekunda")
      )
    );

    expect(klipy[0]?.czasTrwaniaMs).toBe(3000);
    expect(klipy[1]?.czasStartuMs).toBe(4000);
  });

  it("przecina z dociaganiem do 0,5 s", () => {
    const klipy = pobierzKlipyZWyniku(
      przetnijKlipTimeline(
        [klipWideo],
        "klip-1",
        4.26,
        pobierzUstawieniaSiatki("polSekundy")
      )
    );

    expect(klipy[0]?.czasTrwaniaMs).toBe(3500);
    expect(klipy[1]?.czasStartuMs).toBe(4500);
  });

  it("przecina z dociaganiem do klatki", () => {
    const klipy = pobierzKlipyZWyniku(
      przetnijKlipTimeline(
        [klipWideo],
        "klip-1",
        4.061,
        pobierzUstawieniaSiatki("jednaKlatka"),
        25
      )
    );

    expect(klipy[0]?.czasTrwaniaMs).toBe(3080);
    expect(klipy[1]?.czasStartuMs).toBe(4080);
  });

  it("zwraca blad przy cieciu na poczatku", () => {
    expect(przetnijKlipTimeline([klipWideo], "klip-1", 1)).toEqual({
      czySukces: false,
      bledy: [
        {
          pole: "czasCiecia",
          komunikat: "Nie mozna przeciac klipu na poczatku."
        }
      ]
    });
  });

  it("zwraca blad przy cieciu na koncu", () => {
    expect(przetnijKlipTimeline([klipWideo], "klip-1", 9)).toEqual({
      czySukces: false,
      bledy: [
        {
          pole: "czasCiecia",
          komunikat: "Nie mozna przeciac klipu na koncu."
        }
      ]
    });
  });

  it("zwraca blad przy cieciu poza klipem", () => {
    expect(przetnijKlipTimeline([klipWideo], "klip-1", 10)).toEqual({
      czySukces: false,
      bledy: [
        {
          pole: "czasCiecia",
          komunikat: "Czas ciecia jest po klipie."
        }
      ]
    });
  });

  it("zwraca blad dla nieistniejacego klipu", () => {
    expect(przetnijKlipTimeline([klipWideo], "brak", 4)).toEqual({
      czySukces: false,
      bledy: [
        {
          pole: "idKlipu",
          komunikat: "Nie znaleziono klipu timeline."
        }
      ]
    });
  });

  it("zachowuje id medium po cieciu", () => {
    const klipy = pobierzKlipyZWyniku(
      przetnijKlipTimeline([klipWideo], "klip-1", 4)
    );

    expect(klipy.map((klip) => klip.idPlikuMediow)).toEqual([
      "media-1",
      "media-1"
    ]);
  });

  it("poprawnie przelicza zakres zrodla dla wideo", () => {
    const klipy = pobierzKlipyZWyniku(
      przetnijKlipTimeline([klipWideo], "klip-1", 4)
    );

    expect(klipy[0]).toMatchObject({
      zrodloStartMs: 2000,
      zrodloKoniecMs: 5000
    });
    expect(klipy[1]).toMatchObject({
      zrodloStartMs: 5000,
      zrodloKoniecMs: 10000
    });
  });

  it("poprawnie rozdziela grafike", () => {
    const klipy = pobierzKlipyZWyniku(
      przetnijKlipTimeline([klipGrafiki], "grafika-1", 2)
    );

    expect(klipy).toHaveLength(2);
    expect(klipy[0]).toMatchObject({
      idPlikuMediow: "media-grafika-1",
      rodzaj: "grafika",
      czasStartuMs: 0,
      czasTrwaniaMs: 2000
    });
    expect(klipy[1]).toMatchObject({
      idPlikuMediow: "media-grafika-1",
      rodzaj: "grafika",
      czasStartuMs: 2000,
      czasTrwaniaMs: 3000
    });
    expect(klipy[0]?.zrodloStartMs).toBeUndefined();
    expect(klipy[1]?.zrodloKoniecMs).toBeUndefined();
  });
});
