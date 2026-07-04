import { describe, expect, it } from "vitest";

import {
  ograniczCzasDoZakresu,
  przeliczCzasNaProcent,
  przeliczCzasNaPozycje,
  przeliczPozycjeNaCzas,
  przeliczZakresCzasuNaPolozenie
} from "../../../../src/moduly/timeline/przeliczCzasNaPozycje";

describe("ograniczCzasDoZakresu", () => {
  it("zwraca 0 dla czasu ujemnego", () => {
    expect(ograniczCzasDoZakresu(-500, 10_000)).toBe(0);
  });

  it("zwraca czas trwania dla wartosci wiekszej niz dlugosc filmu", () => {
    expect(ograniczCzasDoZakresu(12_000, 10_000)).toBe(10_000);
  });

  it("zostawia poprawny czas bez zmian", () => {
    expect(ograniczCzasDoZakresu(4_250, 10_000)).toBe(4_250);
  });
});

describe("przeliczPozycjeNaCzas", () => {
  it("przelicza srodek timeline na polowe czasu filmu", () => {
    expect(przeliczPozycjeNaCzas(250, 500, 20_000)).toBe(10_000);
  });

  it("ogranicza wynik do 0 przy pozycji przed poczatkiem", () => {
    expect(przeliczPozycjeNaCzas(-20, 500, 20_000)).toBe(0);
  });

  it("ogranicza wynik do czasu trwania przy pozycji za koncem", () => {
    expect(przeliczPozycjeNaCzas(520, 500, 20_000)).toBe(20_000);
  });
});

describe("przeliczCzasNaProcent", () => {
  it("zwraca 0 dla braku czasu trwania", () => {
    expect(przeliczCzasNaProcent(2_000, 0)).toBe(0);
  });

  it("zwraca poprawna wartosc procentowa dla srodka filmu", () => {
    expect(przeliczCzasNaProcent(5_000, 10_000)).toBe(50);
  });
});

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
