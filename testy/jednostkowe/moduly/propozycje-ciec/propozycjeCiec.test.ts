import { describe, expect, it } from "vitest";

import type {
  PropozycjaCiecia,
  SegmentCiszy
} from "../../../../src/domena/timeline/typyTimeline";
import {
  cofnijDecyzjePropozycjiCiecia,
  odrzucPropozycjeCiecia,
  utworzPropozycjeCiecZSegmentowCiszy,
  uzupelnijBrakujacePropozycjeCiec,
  zatwierdzPropozycjeCiecia,
  zatwierdzWszystkiePropozycjeCiec
} from "../../../../src/moduly/propozycje-ciec/indeksPropozycjiCiec";

function utworzSegmentCiszy(
  nadpisaneDane: Partial<SegmentCiszy> = {}
): SegmentCiszy {
  return {
    id: "cisza-1",
    czasPoczatkuMs: 1000,
    czasKoncaMs: 2500,
    status: "oczekuje",
    poziomGlosnosciDb: -48,
    ...nadpisaneDane
  };
}

function utworzPropozycjeCiecia(
  nadpisaneDane: Partial<PropozycjaCiecia> = {}
): PropozycjaCiecia {
  return {
    id: "propozycja-ciecia-cisza-1",
    idSegmentuCiszy: "cisza-1",
    czasPoczatkuMs: 1000,
    czasKoncaMs: 2500,
    status: "oczekuje",
    powod: "cisza",
    utworzonoAutomatycznie: true,
    ...nadpisaneDane
  };
}

describe("propozycje ciec", () => {
  it("zamienia pusta liste segmentow ciszy na pusta liste propozycji", () => {
    expect(utworzPropozycjeCiecZSegmentowCiszy([])).toEqual([]);
  });

  it("tworzy jedna propozycje z jednego segmentu ciszy", () => {
    const segment = utworzSegmentCiszy();

    const propozycje = utworzPropozycjeCiecZSegmentowCiszy([segment]);

    expect(propozycje).toEqual([
      {
        id: "propozycja-ciecia-cisza-1",
        idSegmentuCiszy: "cisza-1",
        czasPoczatkuMs: 1000,
        czasKoncaMs: 2500,
        status: "oczekuje",
        powod: "cisza",
        utworzonoAutomatycznie: true
      }
    ]);
  });

  it("tworzy wiele propozycji z wielu segmentow ciszy", () => {
    const segmenty = [
      utworzSegmentCiszy({ id: "cisza-1" }),
      utworzSegmentCiszy({
        id: "cisza-2",
        czasPoczatkuMs: 4000,
        czasKoncaMs: 5200
      })
    ];

    const propozycje = utworzPropozycjeCiecZSegmentowCiszy(segmenty);

    expect(propozycje).toHaveLength(2);
    expect(propozycje.map((propozycja) => propozycja.id)).toEqual([
      "propozycja-ciecia-cisza-1",
      "propozycja-ciecia-cisza-2"
    ]);
  });

  it("ustawia nowa propozycje jako oczekujaca", () => {
    const [propozycja] = utworzPropozycjeCiecZSegmentowCiszy([
      utworzSegmentCiszy()
    ]);

    expect(propozycja?.status).toBe("oczekuje");
  });

  it("zachowuje czas poczatku i konca segmentu ciszy", () => {
    const [propozycja] = utworzPropozycjeCiecZSegmentowCiszy([
      utworzSegmentCiszy({
        czasPoczatkuMs: 3200,
        czasKoncaMs: 6100
      })
    ]);

    expect(propozycja?.czasPoczatkuMs).toBe(3200);
    expect(propozycja?.czasKoncaMs).toBe(6100);
  });

  it("zatwierdza jedna propozycje bez zmiany pozostalych", () => {
    const propozycje = [
      utworzPropozycjeCiecia({ id: "propozycja-1" }),
      utworzPropozycjeCiecia({ id: "propozycja-2" })
    ];

    const wynik = zatwierdzPropozycjeCiecia(propozycje, "propozycja-1");

    expect(wynik.map((propozycja) => propozycja.status)).toEqual([
      "zatwierdzona",
      "oczekuje"
    ]);
  });

  it("odrzuca jedna propozycje bez zmiany pozostalych", () => {
    const propozycje = [
      utworzPropozycjeCiecia({ id: "propozycja-1" }),
      utworzPropozycjeCiecia({ id: "propozycja-2" })
    ];

    const wynik = odrzucPropozycjeCiecia(propozycje, "propozycja-2");

    expect(wynik.map((propozycja) => propozycja.status)).toEqual([
      "oczekuje",
      "odrzucona"
    ]);
  });

  it("zatwierdza wszystkie oczekujace propozycje", () => {
    const propozycje = [
      utworzPropozycjeCiecia({ id: "propozycja-1" }),
      utworzPropozycjeCiecia({
        id: "propozycja-2",
        status: "odrzucona"
      })
    ];

    const wynik = zatwierdzWszystkiePropozycjeCiec(propozycje);

    expect(wynik.map((propozycja) => propozycja.status)).toEqual([
      "zatwierdzona",
      "odrzucona"
    ]);
  });

  it("cofa decyzje pojedynczej propozycji do statusu oczekuje", () => {
    const propozycje = [
      utworzPropozycjeCiecia({
        id: "propozycja-1",
        status: "zatwierdzona"
      })
    ];

    const wynik = cofnijDecyzjePropozycjiCiecia(
      propozycje,
      "propozycja-1"
    );

    expect(wynik[0]?.status).toBe("oczekuje");
  });

  it("zwraca liste bez zmian przy probie zmiany nieistniejacego id", () => {
    const propozycje = [utworzPropozycjeCiecia()];

    const wynik = zatwierdzPropozycjeCiecia(propozycje, "brak-id");

    expect(wynik).toBe(propozycje);
    expect(wynik).toEqual(propozycje);
  });

  it("nie mutuje danych wejsciowych przy zmianie decyzji", () => {
    const propozycje = [utworzPropozycjeCiecia()];
    const stanPrzedZmiana = structuredClone(propozycje);

    const wynik = zatwierdzPropozycjeCiecia(
      propozycje,
      "propozycja-ciecia-cisza-1"
    );

    expect(wynik).not.toBe(propozycje);
    expect(propozycje).toEqual(stanPrzedZmiana);
  });

  it("uzupelnia tylko brakujace propozycje bez duplikowania segmentu", () => {
    const segmenty = [
      utworzSegmentCiszy({ id: "cisza-1" }),
      utworzSegmentCiszy({ id: "cisza-2" })
    ];
    const istniejacePropozycje = [
      utworzPropozycjeCiecia({
        id: "propozycja-ciecia-cisza-1",
        idSegmentuCiszy: "cisza-1"
      })
    ];

    const wynik = uzupelnijBrakujacePropozycjeCiec(
      segmenty,
      istniejacePropozycje
    );

    expect(wynik).toHaveLength(2);
    expect(wynik.map((propozycja) => propozycja.idSegmentuCiszy)).toEqual([
      "cisza-1",
      "cisza-2"
    ]);
  });

  it("nie duplikuje starszej propozycji bez id segmentu, jesli ma stabilne id", () => {
    const segmenty = [utworzSegmentCiszy({ id: "cisza-1" })];
    const istniejacePropozycje = [
      utworzPropozycjeCiecia({
        id: "propozycja-ciecia-cisza-1",
        idSegmentuCiszy: undefined
      })
    ];

    const wynik = uzupelnijBrakujacePropozycjeCiec(
      segmenty,
      istniejacePropozycje
    );

    expect(wynik).toBe(istniejacePropozycje);
  });

  it("nie nadpisuje istniejacej decyzji przy ponownej synchronizacji", () => {
    const segmenty = [utworzSegmentCiszy({ id: "cisza-1" })];
    const istniejacePropozycje = [
      utworzPropozycjeCiecia({
        idSegmentuCiszy: "cisza-1",
        status: "odrzucona"
      })
    ];

    const wynik = uzupelnijBrakujacePropozycjeCiec(
      segmenty,
      istniejacePropozycje
    );

    expect(wynik).toBe(istniejacePropozycje);
    expect(wynik[0]?.status).toBe("odrzucona");
  });
});
