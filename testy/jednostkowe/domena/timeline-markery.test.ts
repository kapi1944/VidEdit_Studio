import { describe, expect, it } from "vitest";

import {
  dodajMarkerTimeline,
  przesunMarkerTimeline,
  USTAWIENIA_DOCIAGANIA_TIMELINE_MVP,
  usunMarkerTimeline,
  walidujMarkerTimeline,
  type MarkerTimeline
} from "../../../src/domena/timeline/typyTimeline";

const siatkaSekundowa = USTAWIENIA_DOCIAGANIA_TIMELINE_MVP.find(
  (ustawieniaSiatki) => ustawieniaSiatki.jednostka === "sekunda"
);

if (!siatkaSekundowa) {
  throw new Error("Brak sekundowej siatki timeline w testach.");
}

const markerTimeline: MarkerTimeline = {
  id: "marker-1000",
  czasMs: 1000
};

describe("markery timeline", () => {
  it("dodaje marker w podanym czasie", () => {
    const wynikDodania = dodajMarkerTimeline([], 1.25);

    expect(wynikDodania.czySukces).toBe(true);

    if (wynikDodania.czySukces) {
      expect(wynikDodania.dane).toEqual([
        {
          id: "marker-1250",
          czasMs: 1250
        }
      ]);
    }
  });

  it("sortuje markery po dodaniu", () => {
    const wynikDodania = dodajMarkerTimeline([markerTimeline], 0.5);

    expect(wynikDodania.czySukces).toBe(true);

    if (wynikDodania.czySukces) {
      expect(wynikDodania.dane.map((marker) => marker.czasMs)).toEqual([
        500,
        1000
      ]);
    }
  });

  it("przyciaga dodawany marker do aktywnej siatki", () => {
    const wynikDodania = dodajMarkerTimeline([], 1.6, siatkaSekundowa);

    expect(wynikDodania.czySukces).toBe(true);

    if (wynikDodania.czySukces) {
      expect(wynikDodania.dane[0]?.czasMs).toBe(2000);
    }
  });

  it("usuwa marker po id", () => {
    const wynikUsuniecia = usunMarkerTimeline([markerTimeline], "marker-1000");

    expect(wynikUsuniecia.czySukces).toBe(true);

    if (wynikUsuniecia.czySukces) {
      expect(wynikUsuniecia.dane).toEqual([]);
    }
  });

  it("przesuwa marker z uwzglednieniem siatki", () => {
    const wynikPrzesuniecia = przesunMarkerTimeline(
      [markerTimeline],
      "marker-1000",
      2.4,
      siatkaSekundowa
    );

    expect(wynikPrzesuniecia.czySukces).toBe(true);

    if (wynikPrzesuniecia.czySukces) {
      expect(wynikPrzesuniecia.dane).toEqual([
        {
          id: "marker-1000",
          czasMs: 2000
        }
      ]);
    }
  });

  it("odrzuca drugi marker w tym samym miejscu", () => {
    const wynikDodania = dodajMarkerTimeline([markerTimeline], 1);

    expect(wynikDodania.czySukces).toBe(false);

    if (!wynikDodania.czySukces) {
      expect(wynikDodania.bledy).toContainEqual({
        pole: "czas",
        komunikat: "Marker w tym miejscu juz istnieje."
      });
    }
  });

  it("waliduje ujemny czas markera", () => {
    expect(
      walidujMarkerTimeline({
        id: "marker-ujemny",
        czasMs: -1
      })
    ).toContainEqual({
      pole: "czasMs",
      komunikat: "Czas markera nie moze byc ujemny."
    });
  });
});
