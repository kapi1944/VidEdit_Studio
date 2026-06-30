import { describe, expect, it } from "vitest";
import { utworzPlikWideoZDanychImportu } from "../../../src/domena/media/fabrykaMediow";
import {
  pobierzRozszerzeniePliku,
  sprawdzCzyRozszerzenieWideoJestObslugiwane
} from "../../../src/domena/media/rozszerzeniaWideo";
import {
  sprawdzCzyDaneImportuMediowSaPoprawne,
  walidujPlikMediow
} from "../../../src/domena/media/walidacjaMediow";
import type {
  DaneImportuPlikuMediow,
  PlikDoWalidacjiMediow
} from "../../../src/domena/media/typyMediow";

function utworzTestowyPlik(
  nadpisaneDane: Partial<PlikDoWalidacjiMediow> = {}
): PlikDoWalidacjiMediow {
  return {
    name: "nagranie.mp4",
    type: "video/mp4",
    size: 2048,
    ...nadpisaneDane
  };
}

const poprawneDaneImportu: DaneImportuPlikuMediow = {
  id: "media-1",
  nazwaPliku: "nagranie.mp4",
  rozszerzenie: ".mp4",
  typMime: "video/mp4",
  rozmiarBajtow: 2048,
  objectUrl: "blob:http://localhost/media-1",
  czasTrwaniaMs: 120000
};

describe("import mediow", () => {
  it("rozpoznaje obslugiwane rozszerzenie wideo", () => {
    expect(sprawdzCzyRozszerzenieWideoJestObslugiwane(".mp4")).toBe(true);
    expect(sprawdzCzyRozszerzenieWideoJestObslugiwane(".MOV")).toBe(true);
  });

  it("pobiera rozszerzenie pliku bez wzgledu na wielkosc liter", () => {
    expect(pobierzRozszerzeniePliku("Recenzja.MKV")).toBe(".mkv");
  });

  it("akceptuje poprawny plik mp4", () => {
    expect(walidujPlikMediow(utworzTestowyPlik())).toEqual([]);
  });

  it("akceptuje poprawny plik z polskimi znakami w nazwie", () => {
    const bledy = walidujPlikMediow(
      utworzTestowyPlik({
        name: "zażółć gęślą jaźń.mov",
        type: "video/quicktime"
      })
    );

    expect(bledy).toEqual([]);
  });

  it("zwraca blad, gdy format pliku nie jest obslugiwany", () => {
    const bledy = walidujPlikMediow(
      utworzTestowyPlik({
        name: "notatki.txt",
        type: "text/plain"
      })
    );

    expect(bledy).toContainEqual({
      pole: "rozszerzenie",
      komunikat: "Nieobsługiwany format pliku."
    });
  });

  it("zwraca blad, gdy plik jest pusty", () => {
    const bledy = walidujPlikMediow(
      utworzTestowyPlik({
        size: 0
      })
    );

    expect(bledy).toContainEqual({
      pole: "rozmiarBajtow",
      komunikat: "Plik jest pusty."
    });
  });

  it("zwraca blad, gdy nie wybrano pliku", () => {
    const bledy = walidujPlikMediow(null);

    expect(bledy).toEqual([
      {
        pole: "plik",
        komunikat: "Nie wybrano pliku."
      }
    ]);
  });

  it("akceptuje poprawne dane importu mediow", () => {
    expect(sprawdzCzyDaneImportuMediowSaPoprawne(poprawneDaneImportu)).toEqual(
      []
    );
  });

  it("zwraca blad, gdy nie udalo sie utworzyc url podgladu", () => {
    const bledy = sprawdzCzyDaneImportuMediowSaPoprawne({
      ...poprawneDaneImportu,
      objectUrl: ""
    });

    expect(bledy).toContainEqual({
      pole: "objectUrl",
      komunikat: "Nie udało się zaimportować pliku."
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
        rozszerzenie: ".mp4",
        typMime: "video/mp4",
        rozmiarBajtow: 2048,
        objectUrl: "blob:http://localhost/media-1",
        statusImportu: "zaimportowany",
        typ: "wideo",
        czasTrwaniaMs: 120000
      });
    }
  });

  it("nie tworzy pliku wideo z niepoprawnych danych importu", () => {
    const wynik = utworzPlikWideoZDanychImportu({
      ...poprawneDaneImportu,
      nazwaPliku: "nagranie.wav",
      rozszerzenie: ".wav"
    });

    expect(wynik.czySukces).toBe(false);

    if (!wynik.czySukces) {
      expect(wynik.bledy).toContainEqual({
        pole: "rozszerzenie",
        komunikat: "Nieobsługiwany format pliku."
      });
    }
  });
});
