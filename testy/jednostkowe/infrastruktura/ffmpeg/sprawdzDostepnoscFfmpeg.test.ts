import { describe, expect, it } from "vitest";

import { sprawdzDostepnoscFfmpeg } from "../../../../src/infrastruktura/ffmpeg/sprawdzDostepnoscFfmpeg";
import type {
  UruchomProcesFfmpeg,
  WynikProcesuFfmpeg
} from "../../../../src/infrastruktura/ffmpeg/typyFfmpeg";

type OdpowiedzProcesu = WynikProcesuFfmpeg | Error;

function utworzUruchomProces(
  odpowiedzi: Record<string, OdpowiedzProcesu>,
  wywolania: Array<{ polecenie: string; argumenty: string[] }> = []
): UruchomProcesFfmpeg {
  return async (polecenie, argumenty) => {
    wywolania.push({ polecenie, argumenty });

    const odpowiedz = odpowiedzi[polecenie];

    if (odpowiedz instanceof Error) {
      throw odpowiedz;
    }

    return odpowiedz;
  };
}

function poprawnyWynik(stdout: string): WynikProcesuFfmpeg {
  return {
    kodWyjscia: 0,
    stdout,
    stderr: ""
  };
}

function bladBrakuNarzedzia(): Error {
  return Object.assign(new Error("Brak narzedzia"), {
    code: "ENOENT"
  });
}

describe("sprawdzDostepnoscFfmpeg", () => {
  it("sprawdza ffmpeg i ffprobe osobnymi wywolaniami", async () => {
    const wywolania: Array<{ polecenie: string; argumenty: string[] }> = [];
    const uruchomProces = utworzUruchomProces(
      {
        ffmpeg: poprawnyWynik("ffmpeg version 7.1\n"),
        ffprobe: poprawnyWynik("ffprobe version 7.1\n")
      },
      wywolania
    );

    const wynik = await sprawdzDostepnoscFfmpeg(uruchomProces);

    expect(wynik).toEqual({
      czyFfmpegDostepny: true,
      czyFfprobeDostepny: true,
      wersjaFfmpeg: "ffmpeg version 7.1",
      wersjaFfprobe: "ffprobe version 7.1",
      bledy: []
    });
    expect(wywolania).toEqual([
      { polecenie: "ffmpeg", argumenty: ["-version"] },
      { polecenie: "ffprobe", argumenty: ["-version"] }
    ]);
  });

  it("zwraca blad po polsku, gdy ffmpeg nie jest dostepny", async () => {
    const uruchomProces = utworzUruchomProces({
      ffmpeg: bladBrakuNarzedzia(),
      ffprobe: poprawnyWynik("ffprobe version 7.1\n")
    });

    const wynik = await sprawdzDostepnoscFfmpeg(uruchomProces);

    expect(wynik.czyFfmpegDostepny).toBe(false);
    expect(wynik.czyFfprobeDostepny).toBe(true);
    expect(wynik.bledy).toContain(
      "Nie znaleziono narzedzia ffmpeg. Sprawdz, czy FFmpeg jest zainstalowany i dostepny w zmiennej PATH."
    );
  });

  it("zwraca blad po polsku, gdy ffprobe nie jest dostepny", async () => {
    const uruchomProces = utworzUruchomProces({
      ffmpeg: poprawnyWynik("ffmpeg version 7.1\n"),
      ffprobe: bladBrakuNarzedzia()
    });

    const wynik = await sprawdzDostepnoscFfmpeg(uruchomProces);

    expect(wynik.czyFfmpegDostepny).toBe(true);
    expect(wynik.czyFfprobeDostepny).toBe(false);
    expect(wynik.bledy).toContain(
      "Nie znaleziono narzedzia ffprobe. Sprawdz, czy FFprobe jest zainstalowany i dostepny w zmiennej PATH."
    );
  });

  it("obsluguje brak obu narzedzi", async () => {
    const uruchomProces = utworzUruchomProces({
      ffmpeg: bladBrakuNarzedzia(),
      ffprobe: bladBrakuNarzedzia()
    });

    const wynik = await sprawdzDostepnoscFfmpeg(uruchomProces);

    expect(wynik.czyFfmpegDostepny).toBe(false);
    expect(wynik.czyFfprobeDostepny).toBe(false);
    expect(wynik.bledy).toHaveLength(2);
  });

  it("obsluguje proces zakonczony kodem bledu", async () => {
    const uruchomProces = utworzUruchomProces({
      ffmpeg: {
        kodWyjscia: 1,
        stdout: "",
        stderr: "blad uruchomienia"
      },
      ffprobe: poprawnyWynik("ffprobe version 7.1\n")
    });

    const wynik = await sprawdzDostepnoscFfmpeg(uruchomProces);

    expect(wynik.czyFfmpegDostepny).toBe(false);
    expect(wynik.czyFfprobeDostepny).toBe(true);
    expect(wynik.bledy).toContain(
      "Nie udalo sie uruchomic ffmpeg -version."
    );
  });

  it("nie rzuca niekontrolowanego wyjatku przy bledzie procesu", async () => {
    const uruchomProces = utworzUruchomProces({
      ffmpeg: new Error("Awaria procesu"),
      ffprobe: poprawnyWynik("ffprobe version 7.1\n")
    });

    await expect(sprawdzDostepnoscFfmpeg(uruchomProces)).resolves.toMatchObject({
      czyFfmpegDostepny: false,
      czyFfprobeDostepny: true,
      bledy: ["Nie udalo sie uruchomic ffmpeg -version."]
    });
  });
});
