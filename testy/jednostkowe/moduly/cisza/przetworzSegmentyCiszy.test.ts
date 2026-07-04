import { describe, expect, it } from "vitest";

import type {
  SurowySegmentCiszy,
  UstawieniaWykrywaniaCiszy
} from "../../../../src/moduly/cisza/indeksCiszy";
import { przetworzSegmentyCiszy } from "../../../../src/moduly/cisza/indeksCiszy";

const ustawieniaBazowe: UstawieniaWykrywaniaCiszy = {
  progCiszyDb: -45,
  minimalnaDlugoscCiszyMs: 500,
  marginesPrzedMs: 0,
  marginesPoMs: 0,
  minimalnaPrzerwaMiedzySegmentamiMs: 200
};

function utworzSurowySegmentCiszy(
  czasPoczatkuMs: number,
  czasKoncaMs: number,
  poziomDb = -55
): SurowySegmentCiszy {
  const czasTrwaniaMs = czasKoncaMs - czasPoczatkuMs;

  return {
    czasPoczatkuMs,
    czasKoncaMs,
    lacznyCzasCiszyMs: czasTrwaniaMs,
    sumaPoziomowDbWazonaCzasem: poziomDb * czasTrwaniaMs
  };
}

function przetworz(
  segmenty: SurowySegmentCiszy[],
  ustawienia: Partial<UstawieniaWykrywaniaCiszy> = {},
  czasTrwaniaAudioMs = 5000
) {
  return przetworzSegmentyCiszy(
    segmenty,
    {
      ...ustawieniaBazowe,
      ...ustawienia
    },
    czasTrwaniaAudioMs
  );
}

describe("przetworzSegmentyCiszy", () => {
  it("dodaje marginesy do surowego segmentu", () => {
    const segmenty = przetworz([utworzSurowySegmentCiszy(1000, 1800)], {
      marginesPrzedMs: 100,
      marginesPoMs: 200
    });

    expect(segmenty[0]).toMatchObject({
      czasPoczatkuMs: 900,
      czasKoncaMs: 2000
    });
  });

  it("zabezpiecza marginesy przed wyjsciem poza zakres audio", () => {
    const segmenty = przetworz(
      [
        utworzSurowySegmentCiszy(0, 700),
        utworzSurowySegmentCiszy(4400, 5000)
      ],
      {
        marginesPrzedMs: 200,
        marginesPoMs: 300
      },
      5000
    );

    expect(segmenty.map((segment) => ({
      czasPoczatkuMs: segment.czasPoczatkuMs,
      czasKoncaMs: segment.czasKoncaMs
    }))).toEqual([
      {
        czasPoczatkuMs: 0,
        czasKoncaMs: 1000
      },
      {
        czasPoczatkuMs: 4200,
        czasKoncaMs: 5000
      }
    ]);
  });

  it("ignoruje mikroprzerwe przed sprawdzeniem minimalnej dlugosci", () => {
    const segmenty = przetworz([
      utworzSurowySegmentCiszy(1000, 1300),
      utworzSurowySegmentCiszy(1400, 1700)
    ]);

    expect(segmenty).toHaveLength(1);
    expect(segmenty[0]).toMatchObject({
      czasPoczatkuMs: 1000,
      czasKoncaMs: 1700
    });
  });

  it("nie scala segmentow, gdy przerwa jest rowna minimalnej przerwie", () => {
    const segmenty = przetworz([
      utworzSurowySegmentCiszy(1000, 1600),
      utworzSurowySegmentCiszy(1800, 2400)
    ]);

    expect(segmenty).toHaveLength(2);
  });

  it("sortuje segmenty i nadaje stabilne identyfikatory", () => {
    const segmenty = przetworz([
      utworzSurowySegmentCiszy(3000, 3600),
      utworzSurowySegmentCiszy(1000, 1600)
    ]);

    expect(segmenty.map((segment) => segment.id)).toEqual([
      "cisza-1",
      "cisza-2"
    ]);
    expect(segmenty.map((segment) => segment.czasPoczatkuMs)).toEqual([
      1000,
      3000
    ]);
  });

  it("nie modyfikuje surowych segmentow wejsciowych", () => {
    const suroweSegmenty = [
      utworzSurowySegmentCiszy(3000, 3600),
      utworzSurowySegmentCiszy(1000, 1600)
    ];
    const suroweSegmentyPrzedPrzetworzeniem = structuredClone(suroweSegmenty);

    przetworz(suroweSegmenty);

    expect(suroweSegmenty).toEqual(suroweSegmentyPrzedPrzetworzeniem);
  });
});
