import { describe, expect, it } from "vitest";
import { utworzDaneKartyMedium } from "../../../src/domena/media/formatowanieKartyMedium";
import type {
  MetadaneWideo,
  PlikMediow
} from "../../../src/domena/media/typyMediow";
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

function utworzPlikMediow(nadpisaneDane: Partial<PlikMediow> = {}): PlikMediow {
  return {
    id: "media-1",
    nazwaPliku: "nagranie.mp4",
    sciezkaPliku: "nagranie.mp4",
    rozszerzenie: ".mp4",
    typMime: "video/mp4",
    rozmiarBajtow: 2048,
    statusImportu: "zaimportowany",
    typ: "wideo",
    ...nadpisaneDane
  };
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

  it("formatuje kompletne dane karty medium", () => {
    const daneKarty = utworzDaneKartyMedium(
      utworzPlikMediow({
        metadane: utworzMetadaneWideo({
          czasTrwaniaMs: 201000,
          liczbaKlatekNaSekunde: 29.97,
          liczbaSciezekAudio: 1
        })
      }),
      "gotowe"
    );

    expect(daneKarty).toEqual({
      nazwaPliku: "nagranie.mp4",
      typPliku: "video/mp4",
      czasTrwania: "00:03:21",
      rozdzielczosc: "1920 x 1080",
      fps: "29.97",
      audio: "1 sciezka",
      status: "gotowe"
    });
  });

  it("zwraca fallbacki karty medium bez miniatury i metadanych", () => {
    const daneKarty = utworzDaneKartyMedium(
      utworzPlikMediow({
        typMime: "",
        metadane: undefined
      }),
      "Miniatura niedostepna"
    );

    expect(daneKarty.typPliku).toBe(".mp4");
    expect(daneKarty.czasTrwania).toBe("brak");
    expect(daneKarty.rozdzielczosc).toBe("brak");
    expect(daneKarty.fps).toBe("nieustalone");
    expect(daneKarty.audio).toBe("do sprawdzenia");
    expect(daneKarty.status).toBe("Miniatura niedostepna");
  });

  it("nie wymaga pelnych metadanych do danych karty medium", () => {
    const daneKarty = utworzDaneKartyMedium(
      utworzPlikMediow({
        metadane: {
          szerokoscPx: 1920,
          czyMetadanePelne: false
        }
      })
    );

    expect(daneKarty.czasTrwania).toBe("brak");
    expect(daneKarty.rozdzielczosc).toBe("brak");
    expect(daneKarty.fps).toBe("nieustalone");
    expect(daneKarty.audio).toBe("do sprawdzenia");
    expect(daneKarty.status).toBe("gotowe");
  });
});
