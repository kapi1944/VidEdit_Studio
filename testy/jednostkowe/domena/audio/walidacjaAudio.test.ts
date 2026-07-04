import { describe, expect, it } from "vitest";

import type { SciezkaAudio } from "../../../../src/domena/audio/typyAudio";
import { walidujSciezkeAudio } from "../../../../src/domena/audio/walidacjaAudio";

function utworzSciezkeAudio(
  nadpisaneDane: Partial<SciezkaAudio> = {}
): SciezkaAudio {
  return {
    id: "audio-1",
    sciezkaPlikuZrodlowego: "C:\\filmy\\nagranie.mp4",
    sciezkaPlikuAudio: "C:\\roboczy\\audio-1.wav",
    czasTrwaniaMs: 120000,
    format: "wav",
    liczbaKanalow: 1,
    probkowanieHz: 16000,
    ...nadpisaneDane
  };
}

describe("walidacja sciezki audio", () => {
  it("akceptuje poprawna sciezke audio", () => {
    expect(walidujSciezkeAudio(utworzSciezkeAudio())).toEqual([]);
  });

  it("zwraca blad dla ujemnego czasu trwania", () => {
    const bledy = walidujSciezkeAudio(
      utworzSciezkeAudio({ czasTrwaniaMs: -1 })
    );

    expect(bledy).toContainEqual(
      expect.objectContaining({ pole: "czasTrwaniaMs" })
    );
  });

  it("zwraca blad dla zerowego czasu trwania", () => {
    const bledy = walidujSciezkeAudio(
      utworzSciezkeAudio({ czasTrwaniaMs: 0 })
    );

    expect(bledy).toContainEqual(
      expect.objectContaining({ pole: "czasTrwaniaMs" })
    );
  });

  it("zwraca blad dla pustej sciezki pliku audio", () => {
    const bledy = walidujSciezkeAudio(
      utworzSciezkeAudio({ sciezkaPlikuAudio: " " })
    );

    expect(bledy).toContainEqual(
      expect.objectContaining({ pole: "sciezkaPlikuAudio" })
    );
  });

  it("zwraca blad dla pustej sciezki pliku zrodlowego", () => {
    const bledy = walidujSciezkeAudio(
      utworzSciezkeAudio({ sciezkaPlikuZrodlowego: " " })
    );

    expect(bledy).toContainEqual(
      expect.objectContaining({ pole: "sciezkaPlikuZrodlowego" })
    );
  });

  it("zwraca blad dla zerowej liczby kanalow", () => {
    const bledy = walidujSciezkeAudio(
      utworzSciezkeAudio({ liczbaKanalow: 0 })
    );

    expect(bledy).toContainEqual(
      expect.objectContaining({ pole: "liczbaKanalow" })
    );
  });

  it("zwraca blad dla zerowego probkowania", () => {
    const bledy = walidujSciezkeAudio(
      utworzSciezkeAudio({ probkowanieHz: 0 })
    );

    expect(bledy).toContainEqual(
      expect.objectContaining({ pole: "probkowanieHz" })
    );
  });

  it("odrzuca format inny niz wav", () => {
    const sciezkaAudio = {
      ...utworzSciezkeAudio(),
      format: "mp3"
    } as unknown as SciezkaAudio;

    const bledy = walidujSciezkeAudio(sciezkaAudio);

    expect(bledy).toContainEqual(expect.objectContaining({ pole: "format" }));
  });
});
