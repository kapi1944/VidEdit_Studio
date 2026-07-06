import { describe, expect, it } from "vitest";

import {
  ograniczKlipDoZrodla,
  przeliczPrzesuniecieKlipuMysza,
  przeliczTrimLewejKrawedzi,
  przeliczTrimPrawejKrawedzi,
  rozpocznijPrzesuwanieKlipu,
  USTAWIENIA_DOCIAGANIA_TIMELINE_MVP,
  type JednostkaDociaganiaTimeline,
  type KlipTimeline
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

function pobierzUstawieniaSiatki(jednostka: JednostkaDociaganiaTimeline) {
  const ustawienia = USTAWIENIA_DOCIAGANIA_TIMELINE_MVP.find(
    (ustawieniaSiatki) => ustawieniaSiatki.jednostka === jednostka
  );

  if (!ustawienia) {
    throw new Error(`Brak ustawien siatki: ${jednostka}`);
  }

  return ustawienia;
}

function rozpocznijTestowaEdycje(klip: KlipTimeline = klipWideo) {
  return rozpocznijPrzesuwanieKlipu(klip, 100, 1000, 10_000);
}

describe("drag i trim klipu mysza", () => {
  it("przelicza przesuniecie klipu z pikseli na czas", () => {
    const klipPoPrzesunieciu = przeliczPrzesuniecieKlipuMysza(
      rozpocznijTestowaEdycje(),
      250
    );

    expect(klipPoPrzesunieciu).toMatchObject({
      czasStartuMs: 2500,
      czasTrwaniaMs: 8000,
      zrodloStartMs: 2000,
      zrodloKoniecMs: 10000
    });
  });

  it("dociaga przesuniecie klipu do aktywnej siatki", () => {
    const klipPoPrzesunieciu = przeliczPrzesuniecieKlipuMysza(
      rozpocznijTestowaEdycje(),
      240,
      pobierzUstawieniaSiatki("sekunda")
    );

    expect(klipPoPrzesunieciu.czasStartuMs).toBe(2000);
  });

  it("skraca lewa krawedz klipu z aktualizacja wejscia zrodla", () => {
    const klipPoTrimie = przeliczTrimLewejKrawedzi(
      rozpocznijTestowaEdycje(),
      300,
      pobierzUstawieniaSiatki("sekunda")
    );

    expect(klipPoTrimie).toMatchObject({
      czasStartuMs: 3000,
      czasTrwaniaMs: 6000,
      zrodloStartMs: 4000,
      zrodloKoniecMs: 10000
    });
  });

  it("skraca prawa krawedz klipu z aktualizacja wyjscia zrodla", () => {
    const klipPoTrimie = przeliczTrimPrawejKrawedzi(
      rozpocznijTestowaEdycje(),
      -100,
      pobierzUstawieniaSiatki("sekunda")
    );

    expect(klipPoTrimie).toMatchObject({
      czasStartuMs: 1000,
      czasTrwaniaMs: 6000,
      zrodloStartMs: 2000,
      zrodloKoniecMs: 8000
    });
  });

  it("nie pozwala skrocic klipu ponizej minimalnej dlugosci", () => {
    const klipPoTrimie = przeliczTrimLewejKrawedzi(
      rozpocznijTestowaEdycje(),
      2000
    );

    expect(klipPoTrimie.czasStartuMs).toBe(8900);
    expect(klipPoTrimie.czasTrwaniaMs).toBe(100);
  });

  it("usuwa zakres zrodla dla grafiki podczas ograniczania", () => {
    const klipPoOgraniczeniu = ograniczKlipDoZrodla({
      ...klipGrafiki,
      zrodloStartMs: 100,
      zrodloKoniecMs: 1000
    });

    expect(klipPoOgraniczeniu.zrodloStartMs).toBeUndefined();
    expect(klipPoOgraniczeniu.zrodloKoniecMs).toBeUndefined();
  });
});
