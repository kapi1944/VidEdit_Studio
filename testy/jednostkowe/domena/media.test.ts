import { describe, expect, it } from "vitest";
import { utworzPlikWideoZDanychImportu } from "../../../src/domena/media/fabrykaMediow";
import {
  pobierzRozszerzeniePliku,
  sprawdzCzyRozszerzenieWideoJestObslugiwane
} from "../../../src/domena/media/rozszerzeniaWideo";
import { sprawdzCzyDaneImportuMediowSaPoprawne } from "../../../src/domena/media/walidacjaMediow";
import type { DaneImportuPlikuMediow } from "../../../src/domena/media/typyMediow";

const poprawneDaneImportu: DaneImportuPlikuMediow = {
  id: "media-1",
  nazwaPliku: "nagranie.mp4",
  sciezkaPliku: "C:/filmy/nagranie.mp4",
  czasTrwaniaMs: 120000,
  rozmiarBajtow: 2048
};

describe("import mediow", () => {
  it("rozpoznaje obslugiwane rozszerzenie wideo", () => {
    expect(sprawdzCzyRozszerzenieWideoJestObslugiwane(".mp4")).toBe(true);
    expect(sprawdzCzyRozszerzenieWideoJestObslugiwane(".MOV")).toBe(true);
  });

  it("pobiera rozszerzenie pliku bez wzgledu na wielkosc liter", () => {
    expect(pobierzRozszerzeniePliku("Recenzja.MKV")).toBe(".mkv");
  });

  it("akceptuje poprawne dane importu mediow", () => {
    expect(sprawdzCzyDaneImportuMediowSaPoprawne(poprawneDaneImportu)).toEqual(
      []
    );
  });

  it("zwraca blad, gdy nazwa pliku mediow jest pusta", () => {
    const bledy = sprawdzCzyDaneImportuMediowSaPoprawne({
      ...poprawneDaneImportu,
      nazwaPliku: " "
    });

    expect(bledy).toContainEqual({
      pole: "nazwaPliku",
      komunikat: "Nazwa pliku mediów nie może być pusta."
    });
  });

  it("zwraca blad, gdy sciezka pliku mediow jest pusta", () => {
    const bledy = sprawdzCzyDaneImportuMediowSaPoprawne({
      ...poprawneDaneImportu,
      sciezkaPliku: ""
    });

    expect(bledy).toContainEqual({
      pole: "sciezkaPliku",
      komunikat: "Ścieżka pliku mediów nie może być pusta."
    });
  });

  it("zwraca blad, gdy rozszerzenie wideo nie jest obslugiwane", () => {
    const bledy = sprawdzCzyDaneImportuMediowSaPoprawne({
      ...poprawneDaneImportu,
      nazwaPliku: "notatki.txt"
    });

    expect(bledy).toContainEqual({
      pole: "rozszerzenie",
      komunikat: "Format pliku wideo nie jest obsługiwany."
    });
  });

  it("zwraca blad, gdy czas trwania mediow jest ujemny", () => {
    const bledy = sprawdzCzyDaneImportuMediowSaPoprawne({
      ...poprawneDaneImportu,
      czasTrwaniaMs: -1
    });

    expect(bledy).toContainEqual({
      pole: "czasTrwaniaMs",
      komunikat: "Czas nie może być ujemny."
    });
  });

  it("tworzy plik wideo na podstawie danych importu", () => {
    const wynik = utworzPlikWideoZDanychImportu(poprawneDaneImportu);

    expect(wynik.czySukces).toBe(true);

    if (wynik.czySukces) {
      expect(wynik.dane).toEqual({
        id: "media-1",
        nazwaPliku: "nagranie.mp4",
        sciezkaPliku: "C:/filmy/nagranie.mp4",
        typ: "wideo",
        czasTrwaniaMs: 120000
      });
    }
  });

  it("nie tworzy pliku wideo z niepoprawnych danych importu", () => {
    const wynik = utworzPlikWideoZDanychImportu({
      ...poprawneDaneImportu,
      nazwaPliku: "nagranie.wav"
    });

    expect(wynik.czySukces).toBe(false);

    if (!wynik.czySukces) {
      expect(wynik.bledy).toContainEqual({
        pole: "rozszerzenie",
        komunikat: "Format pliku wideo nie jest obsługiwany."
      });
    }
  });
});
