import { describe, expect, it } from "vitest";

import type {
  ProbkaGlosnosciAudio,
  UstawieniaWykrywaniaCiszy
} from "../../../../src/moduly/cisza/indeksCiszy";
import { wykryjCisze } from "../../../../src/moduly/cisza/indeksCiszy";

const ustawieniaBazowe: UstawieniaWykrywaniaCiszy = {
  progCiszyDb: -45,
  minimalnaDlugoscCiszyMs: 500,
  marginesPrzedMs: 0,
  marginesPoMs: 0,
  minimalnaPrzerwaMiedzySegmentamiMs: 200
};

function utworzProbke(
  czasPoczatkuMs: number,
  czasKoncaMs: number,
  poziomDb: number
): ProbkaGlosnosciAudio {
  return {
    czasPoczatkuMs,
    czasKoncaMs,
    poziomDb
  };
}

function wykryj(
  probkiGlosnosci: ProbkaGlosnosciAudio[],
  ustawienia: Partial<UstawieniaWykrywaniaCiszy> = {},
  czasTrwaniaAudioMs = 5000
) {
  return wykryjCisze(
    probkiGlosnosci,
    {
      ...ustawieniaBazowe,
      ...ustawienia
    },
    czasTrwaniaAudioMs
  );
}

describe("wykryjCisze", () => {
  it("zwraca pusta liste, gdy nie ma ciszy", () => {
    const segmenty = wykryj([
      utworzProbke(0, 1000, -20),
      utworzProbke(1000, 2000, -30)
    ]);

    expect(segmenty).toEqual([]);
  });

  it("wykrywa jeden segment ciszy", () => {
    const segmenty = wykryj([
      utworzProbke(0, 1000, -20),
      utworzProbke(1000, 1800, -55),
      utworzProbke(1800, 3000, -18)
    ]);

    expect(segmenty).toEqual([
      {
        id: "cisza-1",
        czasPoczatkuMs: 1000,
        czasKoncaMs: 1800,
        status: "oczekuje",
        poziomGlosnosciDb: -55
      }
    ]);
  });

  it("laczy sasiadujace probki ciszy w jeden segment", () => {
    const segmenty = wykryj([
      utworzProbke(0, 1000, -20),
      utworzProbke(1000, 1400, -55),
      utworzProbke(1400, 1800, -50),
      utworzProbke(1800, 3000, -18)
    ]);

    expect(segmenty).toHaveLength(1);
    expect(segmenty[0]).toMatchObject({
      czasPoczatkuMs: 1000,
      czasKoncaMs: 1800
    });
  });

  it("wykrywa kilka segmentow ciszy z marginesami", () => {
    const segmenty = wykryj(
      [
        utworzProbke(0, 1000, -20),
        utworzProbke(1000, 1800, -55),
        utworzProbke(1800, 3000, -18),
        utworzProbke(3000, 3800, -52),
        utworzProbke(3800, 5000, -19)
      ],
      {
        marginesPrzedMs: 100,
        marginesPoMs: 100
      }
    );

    expect(segmenty.map(({ czasPoczatkuMs, czasKoncaMs }) => ({
      czasPoczatkuMs,
      czasKoncaMs
    }))).toEqual([
      {
        czasPoczatkuMs: 900,
        czasKoncaMs: 1900
      },
      {
        czasPoczatkuMs: 2900,
        czasKoncaMs: 3900
      }
    ]);
  });

  it("wykrywa wiele pauz w poprawnej kolejnosci", () => {
    const segmenty = wykryj([
      utworzProbke(0, 600, -20),
      utworzProbke(600, 1200, -55),
      utworzProbke(1200, 1800, -18),
      utworzProbke(1800, 2500, -53),
      utworzProbke(2500, 3200, -22),
      utworzProbke(3200, 3900, -51),
      utworzProbke(3900, 5000, -19)
    ]);

    expect(segmenty).toHaveLength(3);
    expect(segmenty.map(({ czasPoczatkuMs, czasKoncaMs }) => ({
      czasPoczatkuMs,
      czasKoncaMs
    }))).toEqual([
      {
        czasPoczatkuMs: 600,
        czasKoncaMs: 1200
      },
      {
        czasPoczatkuMs: 1800,
        czasKoncaMs: 2500
      },
      {
        czasPoczatkuMs: 3200,
        czasKoncaMs: 3900
      }
    ]);
  });

  it("ignoruje segment krotszy niz minimalna dlugosc ciszy", () => {
    const segmenty = wykryj([utworzProbke(1000, 1300, -55)]);

    expect(segmenty).toEqual([]);
  });

  it("dodaje margines przed i po ciszy", () => {
    const segmenty = wykryj([utworzProbke(1000, 1800, -55)], {
      marginesPrzedMs: 100,
      marginesPoMs: 200
    });

    expect(segmenty[0]).toMatchObject({
      czasPoczatkuMs: 900,
      czasKoncaMs: 2000
    });
  });

  it("nie pozwala, aby margines przed wyszedl ponizej zera", () => {
    const segmenty = wykryj([utworzProbke(0, 700, -55)], {
      marginesPrzedMs: 200
    });

    expect(segmenty[0]?.czasPoczatkuMs).toBe(0);
  });

  it("nie pozwala, aby margines po wyszedl poza dlugosc audio", () => {
    const segmenty = wykryj(
      [utworzProbke(4300, 5000, -55)],
      {
        marginesPoMs: 300
      },
      5000
    );

    expect(segmenty[0]?.czasKoncaMs).toBe(5000);
  });

  it("scala segmenty, ktore sa blisko siebie", () => {
    const segmenty = wykryj([
      utworzProbke(1000, 1600, -55),
      utworzProbke(1600, 1700, -20),
      utworzProbke(1700, 2300, -52)
    ]);

    expect(segmenty).toHaveLength(1);
    expect(segmenty[0]).toMatchObject({
      czasPoczatkuMs: 1000,
      czasKoncaMs: 2300
    });
  });

  it("nie scala segmentow oddalonych dalej niz minimalna przerwa", () => {
    const segmenty = wykryj([
      utworzProbke(1000, 1600, -55),
      utworzProbke(1600, 1900, -20),
      utworzProbke(1900, 2500, -52)
    ]);

    expect(segmenty).toHaveLength(2);
    expect(segmenty.map((segment) => segment.czasPoczatkuMs)).toEqual([
      1000,
      1900
    ]);
  });

  it("obsluguje cisze na poczatku audio", () => {
    const segmenty = wykryj([utworzProbke(0, 600, -55)]);

    expect(segmenty[0]).toMatchObject({
      czasPoczatkuMs: 0,
      czasKoncaMs: 600
    });
  });

  it("obsluguje cisze na koncu audio", () => {
    const segmenty = wykryj([utworzProbke(4400, 5000, -55)]);

    expect(segmenty[0]).toMatchObject({
      czasPoczatkuMs: 4400,
      czasKoncaMs: 5000
    });
  });

  it("obsluguje pusta tablice probek", () => {
    expect(wykryj([])).toEqual([]);
  });

  it("ignoruje probki niespelniajace progu ciszy", () => {
    const segmenty = wykryj([utworzProbke(1000, 1800, -44)]);

    expect(segmenty).toEqual([]);
  });

  it("traktuje probke rowna progowi jako cisze", () => {
    const segmenty = wykryj([utworzProbke(1000, 1800, -45)]);

    expect(segmenty).toHaveLength(1);
    expect(segmenty[0]).toMatchObject({
      czasPoczatkuMs: 1000,
      czasKoncaMs: 1800
    });
  });

  it("nie modyfikuje wejsciowej tablicy probek", () => {
    const probki = [
      utworzProbke(2000, 2600, -55),
      utworzProbke(0, 500, -20),
      utworzProbke(1000, 1600, -52)
    ];
    const probkiPrzedWykryciem = structuredClone(probki);

    wykryj(probki);

    expect(probki).toEqual(probkiPrzedWykryciem);
  });

  it("zwraca segmenty posortowane po czasie", () => {
    const segmenty = wykryj([
      utworzProbke(3000, 3600, -55),
      utworzProbke(1000, 1600, -52)
    ]);

    expect(segmenty.map((segment) => segment.czasPoczatkuMs)).toEqual([
      1000,
      3000
    ]);
    expect(segmenty.map((segment) => segment.id)).toEqual([
      "cisza-1",
      "cisza-2"
    ]);
  });

  it("odrzuca bledne ustawienia", () => {
    expect(() =>
      wykryj([utworzProbke(1000, 1800, -55)], {
        minimalnaDlugoscCiszyMs: 0
      })
    ).toThrow("Minimalna dlugosc ciszy musi byc wieksza od zera.");
  });

  it("odrzuca ujemne czasy probek", () => {
    expect(() => wykryj([utworzProbke(-1, 500, -55)])).toThrow(
      "Czas probki glosnosci audio nie moze byc ujemny."
    );
  });

  it("nie tworzy propozycji ciecia", () => {
    const [segment] = wykryj([utworzProbke(1000, 1800, -55)]);

    expect(segment).not.toHaveProperty("powod");
    expect(segment).not.toHaveProperty("idSegmentuCiszy");
    expect(segment).not.toHaveProperty("utworzonoAutomatycznie");
  });
});
