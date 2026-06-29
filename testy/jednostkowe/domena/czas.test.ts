import { describe, expect, it } from "vitest";
import {
  formatujCzas
} from "../../../src/domena/czas/formatowanieCzasu";
import {
  przeliczKlatkeNaMs,
  przeliczMsNaKlatke
} from "../../../src/domena/czas/przeliczanieKlatek";
import { sprawdzCzyCzasJestPoprawny } from "../../../src/domena/projekt/walidacjaProjektu";

describe("czas projektu", () => {
  it("zwraca blad, gdy czas jest ujemny", () => {
    const bledy = sprawdzCzyCzasJestPoprawny(-1);

    expect(bledy).toContainEqual({
      pole: "czasMs",
      komunikat: "Czas nie może być ujemny."
    });
  });

  it("formatuje czas w sekundach", () => {
    expect(formatujCzas(12500, "sekundy")).toBe("12.5 s");
  });

  it("formatuje czas jako hh:mm:ss.mmm", () => {
    expect(formatujCzas(72500, "czas")).toBe("00:01:12.500");
  });

  it("przelicza milisekundy na numer klatki", () => {
    expect(przeliczMsNaKlatke(1000, 25)).toBe(25);
    expect(przeliczMsNaKlatke(1500, 24)).toBe(36);
  });

  it("przelicza numer klatki na milisekundy", () => {
    expect(przeliczKlatkeNaMs(25, 25)).toBe(1000);
    expect(przeliczKlatkeNaMs(36, 24)).toBe(1500);
  });
});
