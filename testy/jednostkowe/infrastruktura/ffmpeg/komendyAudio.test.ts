import { describe, expect, it } from "vitest";

import { zbudujKomendeWyodrebnianiaAudio } from "../../../../src/infrastruktura/ffmpeg/komendyAudio";

describe("komendy audio FFmpeg", () => {
  it("buduje argumenty wyodrebniania audio do WAV mono 16000 Hz", () => {
    const komenda = zbudujKomendeWyodrebnianiaAudio({
      sciezkaPlikuZrodlowego: "C:\\filmy\\nagranie.mp4",
      sciezkaPlikuAudio: "C:\\roboczy\\audio_media-1.wav",
      liczbaKanalow: 1,
      probkowanieHz: 16000
    });

    expect(komenda).toEqual({
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
        "C:\\roboczy\\audio_media-1.wav"
      ]
    });
  });

  it("przekazuje sciezki ze spacjami jako osobne argumenty bez recznego quotowania", () => {
    const sciezkaPlikuZrodlowego = "C:\\moje filmy\\nagranie kursu.mp4";
    const sciezkaPlikuAudio = "C:\\katalog roboczy\\audio kursu.wav";
    const komenda = zbudujKomendeWyodrebnianiaAudio({
      sciezkaPlikuZrodlowego,
      sciezkaPlikuAudio,
      liczbaKanalow: 1,
      probkowanieHz: 16000
    });

    expect(komenda.argumenty[2]).toBe(sciezkaPlikuZrodlowego);
    expect(komenda.argumenty.at(-1)).toBe(sciezkaPlikuAudio);
    expect(komenda.argumenty).not.toContain(`"${sciezkaPlikuZrodlowego}"`);
    expect(komenda.argumenty).not.toContain(`"${sciezkaPlikuAudio}"`);
  });

  it("zachowuje sciezki z polskimi znakami jako osobne argumenty", () => {
    const sciezkaPlikuZrodlowego = "C:\\filmy\\zażółć gęślą jaźń.mp4";
    const sciezkaPlikuAudio = "C:\\roboczy\\audio_zażółć.wav";
    const komenda = zbudujKomendeWyodrebnianiaAudio({
      sciezkaPlikuZrodlowego,
      sciezkaPlikuAudio,
      liczbaKanalow: 1,
      probkowanieHz: 16000
    });

    expect(komenda.argumenty[2]).toBe(sciezkaPlikuZrodlowego);
    expect(komenda.argumenty.at(-1)).toBe(sciezkaPlikuAudio);
  });
});
