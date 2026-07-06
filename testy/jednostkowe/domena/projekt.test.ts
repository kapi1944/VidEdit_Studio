import { describe, expect, it } from "vitest";
import { utworzPustyProjekt } from "../../../src/domena/projekt/fabrykaProjektu";
import {
  sprawdzCzyProjektJestPoprawny,
  sprawdzCzySegmentCzasuJestPoprawny
} from "../../../src/domena/projekt/walidacjaProjektu";
import type { SegmentCzasu } from "../../../src/domena/timeline/typyTimeline";

describe("projekt montazu", () => {
  it("tworzy pusty projekt z domyslnymi ustawieniami", () => {
    const projekt = utworzPustyProjekt("Nowy projekt");

    expect(projekt.nazwa).toBe("Nowy projekt");
    expect(projekt.wersjaModelu).toBe(1);
    expect(projekt.media).toEqual([]);
    expect(projekt.audio).toEqual({
      statusAnalizyAudio: "brak",
      segmentyCiszy: []
    });
    expect(projekt.timeline.klipy).toEqual([]);
    expect(projekt.timeline.markery).toEqual([]);
    expect(projekt.timeline.ustawieniaDociagania).toEqual({
      wlaczone: false,
      tryb: "brak",
      jednostka: "brak"
    });
    expect(projekt.timeline.segmentyCiszy).toEqual([]);
    expect(projekt.timeline.propozycjeCiec).toEqual([]);
    expect(projekt.ustawienia.formatWyswietlaniaCzasu).toBe("czas");
  });

  it("akceptuje poprawny projekt", () => {
    const projekt = utworzPustyProjekt("Kurs montazu");

    expect(sprawdzCzyProjektJestPoprawny(projekt)).toEqual([]);
  });

  it("zwraca blad, gdy nazwa projektu jest pusta", () => {
    const projekt = utworzPustyProjekt("   ");

    const bledy = sprawdzCzyProjektJestPoprawny(projekt);

    expect(bledy).toContainEqual({
      pole: "nazwa",
      komunikat: "Nazwa projektu nie może być pusta."
    });
  });

  it("akceptuje poprawny segment czasu", () => {
    const segment: SegmentCzasu = {
      id: "segment-1",
      czasPoczatkuMs: 1000,
      czasKoncaMs: 2500
    };

    expect(sprawdzCzySegmentCzasuJestPoprawny(segment)).toEqual([]);
  });

  it("zwraca blad, gdy czas konca segmentu jest mniejszy niz czas poczatku", () => {
    const segment: SegmentCzasu = {
      id: "segment-1",
      czasPoczatkuMs: 2500,
      czasKoncaMs: 1000
    };

    const bledy = sprawdzCzySegmentCzasuJestPoprawny(segment);

    expect(bledy).toContainEqual({
      pole: "czasKoncaMs",
      komunikat: "Czas końca segmentu musi być większy niż czas początku."
    });
  });

  it("zwraca blad, gdy czas konca segmentu jest rowny czasowi poczatku", () => {
    const segment: SegmentCzasu = {
      id: "segment-1",
      czasPoczatkuMs: 1000,
      czasKoncaMs: 1000
    };

    const bledy = sprawdzCzySegmentCzasuJestPoprawny(segment);

    expect(bledy).toContainEqual({
      pole: "czasKoncaMs",
      komunikat: "Czas końca segmentu musi być większy niż czas początku."
    });
  });
});
