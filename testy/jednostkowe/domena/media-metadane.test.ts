import { describe, expect, it } from "vitest";
import type { MetadaneWideo } from "../../../src/domena/media/typyMediow";
import { zwalidujMetadaneWideo } from "../../../src/domena/media/walidacjaMetadanychWideo";

function utworzMetadaneWideo(
  nadpisaneDane: Partial<MetadaneWideo> = {}
): MetadaneWideo {
  return {
    czasTrwaniaMs: 125000,
    szerokoscPx: 1920,
    wysokoscPx: 1080,
    czyMetadanePelne: false,
    ...nadpisaneDane
  };
}

function oczekujBladPola(metadane: MetadaneWideo, pole: string) {
  expect(
    zwalidujMetadaneWideo(metadane).some((blad) => blad.pole === pole)
  ).toBe(true);
}

describe("metadane wideo", () => {
  it("akceptuje podstawowe metadane wideo", () => {
    expect(zwalidujMetadaneWideo(utworzMetadaneWideo())).toEqual([]);
  });

  it("odrzuca ujemny czas trwania", () => {
    oczekujBladPola(utworzMetadaneWideo({ czasTrwaniaMs: -1 }), "czasTrwaniaMs");
  });

  it("odrzuca czas trwania NaN", () => {
    oczekujBladPola(
      utworzMetadaneWideo({ czasTrwaniaMs: Number.NaN }),
      "czasTrwaniaMs"
    );
  });

  it("odrzuca nieskonczony czas trwania", () => {
    oczekujBladPola(
      utworzMetadaneWideo({ czasTrwaniaMs: Number.POSITIVE_INFINITY }),
      "czasTrwaniaMs"
    );
  });

  it("odrzuca rozdzielczosc 0x0", () => {
    oczekujBladPola(
      utworzMetadaneWideo({ szerokoscPx: 0, wysokoscPx: 0 }),
      "rozdzielczosc"
    );
  });

  it("odrzuca ujemna szerokosc", () => {
    oczekujBladPola(utworzMetadaneWideo({ szerokoscPx: -1 }), "szerokoscPx");
  });

  it("odrzuca ujemna wysokosc", () => {
    oczekujBladPola(utworzMetadaneWideo({ wysokoscPx: -1 }), "wysokoscPx");
  });
});
