import { describe, expect, it } from "vitest";
import {
  utworzPlikMediowZDanychImportu,
  utworzPlikWideoZDanychImportu
} from "../../../src/domena/media/fabrykaMediow";
import {
  pobierzRozszerzeniePliku,
  sprawdzCzyRozszerzenieMediowJestObslugiwane,
  sprawdzCzyRozszerzenieWideoJestObslugiwane
} from "../../../src/domena/media/rozszerzeniaWideo";
import {
  sprawdzCzyDaneImportuMediowSaPoprawne,
  walidujPlikMediow
} from "../../../src/domena/media/walidacjaMediow";
import { formatujFpsMedium } from "../../../src/domena/media/formatowanieKartyMedium";
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
  sciezkaPliku: "nagranie.mp4",
  rozszerzenie: ".mp4",
  typMime: "video/mp4",
  rozmiarBajtow: 2048,
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

  it("akceptuje poprawny plik graficzny", () => {
    expect(
      walidujPlikMediow(
        utworzTestowyPlik({
          name: "plansza.png",
          type: "image/png"
        })
      )
    ).toEqual([]);
    expect(sprawdzCzyRozszerzenieMediowJestObslugiwane(".PNG")).toBe(true);
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

  it("zwraca blad, gdy brakuje identyfikatora pliku", () => {
    const bledy = sprawdzCzyDaneImportuMediowSaPoprawne({
      ...poprawneDaneImportu,
      sciezkaPliku: ""
    });

    expect(bledy).toContainEqual({
      pole: "sciezkaPliku",
      komunikat: "Brak identyfikatora pliku."
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
        sciezkaPliku: "nagranie.mp4",
        rozszerzenie: ".mp4",
        typMime: "video/mp4",
        rozmiarBajtow: 2048,
        statusImportu: "zaimportowany",
        typ: "wideo",
        czasTrwaniaMs: 120000
      });
    }
  });

  it("tworzy plik grafiki na podstawie danych importu", () => {
    const wynik = utworzPlikMediowZDanychImportu({
      id: "media-grafika-1",
      nazwaPliku: "plansza.png",
      sciezkaPliku: "plansza.png",
      rozszerzenie: ".png",
      typMime: "image/png",
      rozmiarBajtow: 1024
    });

    expect(wynik.czySukces).toBe(true);

    if (wynik.czySukces) {
      expect(wynik.dane.typ).toBe("grafika");
      expect(formatujFpsMedium(wynik.dane)).toBe("brak");
    }
  });

  it("nie tworzy pliku wideo z danych grafiki", () => {
    const wynik = utworzPlikWideoZDanychImportu({
      ...poprawneDaneImportu,
      nazwaPliku: "plansza.png",
      rozszerzenie: ".png",
      typMime: "image/png"
    });

    expect(wynik.czySukces).toBe(false);
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
