import { describe, expect, it } from "vitest";

import type { PlikMediow } from "../../../../src/domena/media/typyMediow";
import type { WykonajKomendeFfmpeg } from "../../../../src/infrastruktura/ffmpeg/wykonajKomendeFfmpeg";
import { wyodrebnijAudio } from "../../../../src/moduly/audio/wyodrebnijAudio";

type WywolanieFfmpeg = Parameters<WykonajKomendeFfmpeg>[0];

function utworzPlikMediow(nadpisaneDane: Partial<PlikMediow> = {}): PlikMediow {
  return {
    id: "media-1",
    nazwaPliku: "nagranie.mp4",
    sciezkaPliku: "C:\\filmy\\nagranie.mp4",
    rozszerzenie: ".mp4",
    typMime: "video/mp4",
    rozmiarBajtow: 2048,
    statusImportu: "zaimportowany",
    typ: "wideo",
    czasTrwaniaMs: 120000,
    metadane: {
      czasTrwaniaMs: 120000,
      liczbaSciezekAudio: 1,
      czyMetadanePelne: true
    },
    ...nadpisaneDane
  };
}

function utworzWykonawceFfmpeg(
  wywolania: WywolanieFfmpeg[] = []
): WykonajKomendeFfmpeg {
  return async (parametry) => {
    wywolania.push(parametry);

    return {
      kodWyjscia: 0,
      stdout: "",
      stderr: ""
    };
  };
}

function utworzWykonawceFfmpegZBledem(
  wywolania: WywolanieFfmpeg[] = []
): WykonajKomendeFfmpeg {
  return async (parametry) => {
    wywolania.push(parametry);

    return {
      kodWyjscia: 1,
      stdout: "",
      stderr: "blad ffmpeg"
    };
  };
}

function utworzNiedostepnyFfmpeg(): WykonajKomendeFfmpeg {
  return async () => {
    throw Object.assign(new Error("spawn ffmpeg ENOENT"), {
      code: "ENOENT"
    });
  };
}

describe("wyodrebnijAudio", () => {
  it("poprawnie buduje komende FFmpeg", async () => {
    const wywolania: WywolanieFfmpeg[] = [];

    await wyodrebnijAudio({
      plikMediow: utworzPlikMediow(),
      katalogRoboczy: "C:\\roboczy",
      wykonajKomendeFfmpeg: utworzWykonawceFfmpeg(wywolania),
      utworzId: () => "audio-test"
    });

    expect(wywolania).toEqual([
      {
        program: "ffmpeg",
        argumenty: [
          "-y",
          "-i",
          "C:\\filmy\\nagranie.mp4",
          "-vn",
          "-ac",
          "1",
          "-ar",
          "16000",
          "-f",
          "wav",
          "C:\\roboczy\\audio-test.wav"
        ]
      }
    ]);
  });

  it("przekazuje sciezke wejsciowa i wyjsciowa jako osobne argumenty", async () => {
    const wywolania: WywolanieFfmpeg[] = [];

    await wyodrebnijAudio({
      plikMediow: utworzPlikMediow({
        sciezkaPliku: "C:\\filmy\\nagranie z kursu.mp4"
      }),
      katalogRoboczy: "C:\\katalog roboczy",
      wykonajKomendeFfmpeg: utworzWykonawceFfmpeg(wywolania),
      utworzId: () => "audio-test"
    });

    const argumenty = wywolania[0]?.argumenty ?? [];

    expect(argumenty[2]).toBe("C:\\filmy\\nagranie z kursu.mp4");
    expect(argumenty.at(-1)).toBe("C:\\katalog roboczy\\audio-test.wav");
    expect(argumenty).not.toContain('"C:\\filmy\\nagranie z kursu.mp4"');
  });

  it("obsluguje sciezke wejsciowa ze spacjami", async () => {
    const wywolania: WywolanieFfmpeg[] = [];

    await wyodrebnijAudio({
      plikMediow: utworzPlikMediow({
        sciezkaPliku: "C:\\moje filmy\\recenzja produktu.mp4"
      }),
      katalogRoboczy: "C:\\roboczy",
      wykonajKomendeFfmpeg: utworzWykonawceFfmpeg(wywolania),
      utworzId: () => "audio-test"
    });

    expect(wywolania[0]?.argumenty[2]).toBe(
      "C:\\moje filmy\\recenzja produktu.mp4"
    );
  });

  it("obsluguje sciezke wejsciowa z polskimi znakami", async () => {
    const wywolania: WywolanieFfmpeg[] = [];

    await wyodrebnijAudio({
      plikMediow: utworzPlikMediow({
        sciezkaPliku: "C:\\filmy\\zażółć gęślą jaźń.mp4"
      }),
      katalogRoboczy: "C:\\roboczy",
      wykonajKomendeFfmpeg: utworzWykonawceFfmpeg(wywolania),
      utworzId: () => "audio-test"
    });

    expect(wywolania[0]?.argumenty[2]).toBe(
      "C:\\filmy\\zażółć gęślą jaźń.mp4"
    );
  });

  it("zwraca poprawny obiekt SciezkaAudio", async () => {
    const wynik = await wyodrebnijAudio({
      plikMediow: utworzPlikMediow(),
      katalogRoboczy: "C:\\roboczy",
      wykonajKomendeFfmpeg: utworzWykonawceFfmpeg(),
      utworzId: () => "audio-test"
    });

    expect(wynik).toEqual({
      id: "audio-test",
      sciezkaPlikuZrodlowego: "C:\\filmy\\nagranie.mp4",
      sciezkaPlikuAudio: "C:\\roboczy\\audio-test.wav",
      czasTrwaniaMs: 120000,
      format: "wav",
      liczbaKanalow: 1,
      probkowanieHz: 16000
    });
  });

  it("ustawia format wav", async () => {
    const wynik = await wyodrebnijAudio({
      plikMediow: utworzPlikMediow(),
      katalogRoboczy: "C:\\roboczy",
      wykonajKomendeFfmpeg: utworzWykonawceFfmpeg()
    });

    expect(wynik.format).toBe("wav");
  });

  it("ustawia liczbaKanalow na 1", async () => {
    const wynik = await wyodrebnijAudio({
      plikMediow: utworzPlikMediow(),
      katalogRoboczy: "C:\\roboczy",
      wykonajKomendeFfmpeg: utworzWykonawceFfmpeg()
    });

    expect(wynik.liczbaKanalow).toBe(1);
  });

  it("ustawia probkowanieHz na 16000", async () => {
    const wynik = await wyodrebnijAudio({
      plikMediow: utworzPlikMediow(),
      katalogRoboczy: "C:\\roboczy",
      wykonajKomendeFfmpeg: utworzWykonawceFfmpeg()
    });

    expect(wynik.probkowanieHz).toBe(16000);
  });

  it("rzuca kontrolowany blad, gdy brakuje sciezki zrodlowej", async () => {
    await expect(
      wyodrebnijAudio({
        plikMediow: utworzPlikMediow({ sciezkaPliku: "" }),
        katalogRoboczy: "C:\\roboczy",
        wykonajKomendeFfmpeg: utworzWykonawceFfmpeg()
      })
    ).rejects.toMatchObject({
      kod: "brak_sciezki_zrodlowej"
    });
  });

  it("rzuca kontrolowany blad, gdy brakuje katalogu roboczego", async () => {
    await expect(
      wyodrebnijAudio({
        plikMediow: utworzPlikMediow(),
        katalogRoboczy: " ",
        wykonajKomendeFfmpeg: utworzWykonawceFfmpeg()
      })
    ).rejects.toMatchObject({
      kod: "brak_katalogu_roboczego"
    });
  });

  it("rzuca kontrolowany blad, gdy plik nie ma audio", async () => {
    const wywolania: WywolanieFfmpeg[] = [];

    await expect(
      wyodrebnijAudio({
        plikMediow: utworzPlikMediow({
          metadane: {
            czasTrwaniaMs: 120000,
            liczbaSciezekAudio: 0,
            czyMetadanePelne: true
          }
        }),
        katalogRoboczy: "C:\\roboczy",
        wykonajKomendeFfmpeg: utworzWykonawceFfmpeg(wywolania)
      })
    ).rejects.toMatchObject({
      kod: "plik_bez_audio"
    });
    expect(wywolania).toEqual([]);
  });

  it("rzuca kontrolowany blad, gdy FFmpeg zwraca blad", async () => {
    await expect(
      wyodrebnijAudio({
        plikMediow: utworzPlikMediow(),
        katalogRoboczy: "C:\\roboczy",
        wykonajKomendeFfmpeg: utworzWykonawceFfmpegZBledem()
      })
    ).rejects.toMatchObject({
      kod: "blad_ffmpeg"
    });
  });

  it("rzuca kontrolowany blad, gdy FFmpeg nie jest dostepny", async () => {
    await expect(
      wyodrebnijAudio({
        plikMediow: utworzPlikMediow(),
        katalogRoboczy: "C:\\roboczy",
        wykonajKomendeFfmpeg: utworzNiedostepnyFfmpeg()
      })
    ).rejects.toMatchObject({
      kod: "ffmpeg_niedostepny"
    });
  });

  it("nie modyfikuje obiektu PlikMediow", async () => {
    const plikMediow = utworzPlikMediow();
    const kopiaPlikuMediow = JSON.parse(JSON.stringify(plikMediow));

    await wyodrebnijAudio({
      plikMediow,
      katalogRoboczy: "C:\\roboczy",
      wykonajKomendeFfmpeg: utworzWykonawceFfmpeg()
    });

    expect(plikMediow).toEqual(kopiaPlikuMediow);
  });

  it("nie uruchamia wykrywania ciszy", async () => {
    const wywolania: WywolanieFfmpeg[] = [];

    await wyodrebnijAudio({
      plikMediow: utworzPlikMediow(),
      katalogRoboczy: "C:\\roboczy",
      wykonajKomendeFfmpeg: utworzWykonawceFfmpeg(wywolania)
    });

    expect(wywolania).toHaveLength(1);
    expect(wywolania[0]?.argumenty).not.toContain("silencedetect");
  });
});
