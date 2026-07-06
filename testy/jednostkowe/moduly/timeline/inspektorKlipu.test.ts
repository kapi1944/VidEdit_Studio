import { describe, expect, it } from "vitest";

import type { PlikMediow } from "../../../../src/domena/media/typyMediow";
import {
  DOMYSLNE_SCIEZKI_TIMELINE,
  DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE,
  USTAWIENIA_DOCIAGANIA_TIMELINE_MVP,
  type KlipTimeline,
  type UstawieniaSiatkiTimeline
} from "../../../../src/domena/timeline/typyTimeline";
import { utworzDaneInspektoraKlipu } from "../../../../src/moduly/timeline/inspektorKlipu";

const klipTimeline: KlipTimeline = {
  id: "klip-1",
  idPlikuMediow: "medium-1",
  rodzaj: "wideo",
  czasStartuMs: 1500,
  czasTrwaniaMs: 2500,
  sciezkaId: "sciezka-wideo-1",
  nazwa: "Klip testowy"
};

const medium: PlikMediow = {
  id: "medium-1",
  nazwaPliku: "nagranie.mp4",
  sciezkaPliku: "nagranie.mp4",
  rozszerzenie: "mp4",
  typMime: "video/mp4",
  rozmiarBajtow: 1024,
  statusImportu: "zaimportowany",
  typ: "wideo"
};

function formatujCzasTestowy(czasMs: number) {
  return `${czasMs} ms`;
}

function pobierzSiatkeSekundowa(): UstawieniaSiatkiTimeline {
  const ustawienia = USTAWIENIA_DOCIAGANIA_TIMELINE_MVP.find(
    (ustawieniaSiatki) => ustawieniaSiatki.jednostka === "sekunda"
  );

  if (!ustawienia) {
    throw new Error("Brak sekundowej siatki timeline.");
  }

  return ustawienia;
}

describe("inspektor klipu timeline", () => {
  it("tworzy dane odczytowe zaznaczonego klipu", () => {
    const daneInspektora = utworzDaneInspektoraKlipu({
      klipTimeline,
      media: [medium],
      sciezkiTimeline: DOMYSLNE_SCIEZKI_TIMELINE,
      ustawieniaSiatkiTimeline: pobierzSiatkeSekundowa(),
      formatujCzasTimeline: formatujCzasTestowy
    });

    expect(daneInspektora?.wiersze).toEqual([
      { etykieta: "Medium", wartosc: "nagranie.mp4" },
      { etykieta: "Typ klipu", wartosc: "Wideo" },
      { etykieta: "Start", wartosc: "1500 ms" },
      { etykieta: "Koniec", wartosc: "4000 ms" },
      { etykieta: "Czas trwania", wartosc: "2500 ms" },
      { etykieta: "Ścieżka", wartosc: "Wideo 1" },
      { etykieta: "Snap / siatka", wartosc: "1 s" }
    ]);
  });

  it("zwraca pusty stan bez zaznaczonego klipu", () => {
    expect(
      utworzDaneInspektoraKlipu({
        klipTimeline: undefined,
        media: [medium],
        sciezkiTimeline: DOMYSLNE_SCIEZKI_TIMELINE,
        ustawieniaSiatkiTimeline: DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE,
        formatujCzasTimeline: formatujCzasTestowy
      })
    ).toBeUndefined();
  });

  it("pokazuje bezpieczny fallback, gdy brakuje medium", () => {
    const daneInspektora = utworzDaneInspektoraKlipu({
      klipTimeline,
      media: [],
      sciezkiTimeline: DOMYSLNE_SCIEZKI_TIMELINE,
      ustawieniaSiatkiTimeline: DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE,
      formatujCzasTimeline: formatujCzasTestowy
    });

    expect(daneInspektora?.wiersze[0]).toEqual({
      etykieta: "Medium",
      wartosc: "Klip testowy (medium niedostępne)"
    });
  });
});
