import { describe, expect, it } from "vitest";

import {
  przeliczCzasNaPozycje,
  przeliczZakresCzasuNaPolozenie
} from "../../../../src/moduly/timeline/przeliczCzasNaPozycje";

describe("przeliczCzasNaPozycje", () => {
  it("zwraca 0 procent dla poczatku filmu", () => {
    expect(przeliczCzasNaPozycje(0, 10_000)).toBe(0);
  });

  it("zwraca 100 procent dla konca filmu", () => {
    expect(przeliczCzasNaPozycje(10_000, 10_000)).toBe(100);
  });

  it("wylicza polozenie segmentu w srodku filmu", () => {
    const polozenie = przeliczZakresCzasuNaPolozenie(2_500, 4_000, 10_000);

    expect(polozenie.polozenieOdLewejProcent).toBe(25);
  });

  it("wylicza szerokosc segmentu", () => {
    const polozenie = przeliczZakresCzasuNaPolozenie(2_000, 4_500, 10_000);

    expect(polozenie.szerokoscProcent).toBe(25);
  });

  it("zabezpiecza segment wychodzacy poza zakres filmu", () => {
    const polozenie = przeliczZakresCzasuNaPolozenie(-1_000, 12_000, 10_000);

    expect(polozenie).toEqual({
      polozenieOdLewejProcent: 0,
      szerokoscProcent: 100
    });
  });

  it("nie dzieli przez zero przy filmie bez czasu trwania", () => {
    expect(przeliczCzasNaPozycje(1_000, 0)).toBe(0);
    expect(przeliczZakresCzasuNaPolozenie(100, 200, 0)).toEqual({
      polozenieOdLewejProcent: 0,
      szerokoscProcent: 0
    });
  });
});
