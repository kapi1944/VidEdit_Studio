import { describe, expect, it } from "vitest";

import {
  DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE,
  opiszTrybSiatkiTimeline,
  przyciagnijCzasDoSiatki,
  USTAWIENIA_DOCIAGANIA_TIMELINE_MVP,
  type JednostkaDociaganiaTimeline,
  type UstawieniaSiatkiTimeline
} from "../../../src/domena/timeline/typyTimeline";

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

describe("siatka timeline", () => {
  it("tryb bez zwraca oryginalny czas", () => {
    expect(
      przyciagnijCzasDoSiatki(1.23456789, DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE)
    ).toBe(1.23456789);
  });

  it("zaokragla do 1 s", () => {
    expect(przyciagnijCzasDoSiatki(1.6, pobierzUstawieniaSiatki("sekunda"))).toBe(
      2
    );
  });

  it("zaokragla do 0,5 s", () => {
    expect(
      przyciagnijCzasDoSiatki(1.26, pobierzUstawieniaSiatki("polSekundy"))
    ).toBe(1.5);
  });

  it("zaokragla do 0,1 s", () => {
    expect(
      przyciagnijCzasDoSiatki(1.24, pobierzUstawieniaSiatki("dziesiataSekundy"))
    ).toBe(1.2);
  });

  it("zaokragla do 1 klatki przy 25 FPS", () => {
    expect(
      przyciagnijCzasDoSiatki(0.061, pobierzUstawieniaSiatki("jednaKlatka"), 25)
    ).toBe(0.08);
  });

  it("zaokragla do 5 klatek przy 25 FPS", () => {
    expect(
      przyciagnijCzasDoSiatki(0.31, pobierzUstawieniaSiatki("piecKlatek"), 25)
    ).toBe(0.4);
  });

  it("zaokragla do 10 klatek przy 25 FPS", () => {
    expect(
      przyciagnijCzasDoSiatki(0.61, pobierzUstawieniaSiatki("dziesiecKlatek"), 25)
    ).toBe(0.8);
  });

  it("obsluguje 30 FPS", () => {
    expect(
      przyciagnijCzasDoSiatki(0.052, pobierzUstawieniaSiatki("jednaKlatka"), 30)
    ).toBe(0.066667);
  });

  it("zabezpiecza wynik przed ujemnym czasem", () => {
    expect(
      przyciagnijCzasDoSiatki(-0.2, pobierzUstawieniaSiatki("sekunda"))
    ).toBe(0);
  });

  it("stabilnie opisuje tryby siatki", () => {
    expect(opiszTrybSiatkiTimeline(DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE)).toBe(
      "Bez dociagania"
    );
    expect(opiszTrybSiatkiTimeline(pobierzUstawieniaSiatki("sekunda"))).toBe(
      "1 s"
    );
    expect(opiszTrybSiatkiTimeline(pobierzUstawieniaSiatki("polSekundy"))).toBe(
      "0,5 s"
    );
    expect(
      opiszTrybSiatkiTimeline(pobierzUstawieniaSiatki("dziesiataSekundy"))
    ).toBe("0,1 s");
    expect(opiszTrybSiatkiTimeline(pobierzUstawieniaSiatki("jednaKlatka"))).toBe(
      "1 klatka"
    );
    expect(opiszTrybSiatkiTimeline(pobierzUstawieniaSiatki("piecKlatek"))).toBe(
      "5 klatek"
    );
    expect(
      opiszTrybSiatkiTimeline(pobierzUstawieniaSiatki("dziesiecKlatek"))
    ).toBe("10 klatek");
  });
});
