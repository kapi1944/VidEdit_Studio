import { describe, expect, it, vi } from "vitest";

import {
  adresStatusuFfmpegLokalnegoMostu,
  BladLokalnegoMostu,
  pobierzStatusFfmpegZLokalnegoMostu,
  type StatusFfmpegLokalnegoMostu
} from "../../../../src/infrastruktura/lokalny-most/klientLokalnegoMostu";

function ustawFetch(odpowiedz: Response | Promise<Response>): ReturnType<typeof vi.fn> {
  const pobierz = vi.fn().mockResolvedValue(odpowiedz);
  vi.stubGlobal("fetch", pobierz);

  return pobierz;
}

describe("pobierzStatusFfmpegZLokalnegoMostu", () => {
  it("pobiera status FFmpeg z lokalnego mostu", async () => {
    const status: StatusFfmpegLokalnegoMostu = {
      czyFfmpegDostepny: true,
      czyFfprobeDostepny: true,
      wersjaFfmpeg: "ffmpeg version 7.1",
      wersjaFfprobe: "ffprobe version 7.1",
      blad: null
    };
    const pobierz = ustawFetch(Response.json(status));

    await expect(pobierzStatusFfmpegZLokalnegoMostu()).resolves.toEqual(status);
    expect(pobierz).toHaveBeenCalledWith(adresStatusuFfmpegLokalnegoMostu);
  });

  it("zwraca czytelny blad, gdy most nie odpowiada", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    await expect(pobierzStatusFfmpegZLokalnegoMostu()).rejects.toThrow(
      "Nie udalo sie polaczyc z lokalnym mostem FFmpeg. Sprawdz, czy uruchomiono npm run dev:most."
    );
  });

  it("zwraca czytelny blad przy odpowiedzi HTTP bledu", async () => {
    ustawFetch(new Response(null, { status: 500 }));

    await expect(pobierzStatusFfmpegZLokalnegoMostu()).rejects.toBeInstanceOf(
      BladLokalnegoMostu
    );
    await expect(pobierzStatusFfmpegZLokalnegoMostu()).rejects.toThrow(
      "Lokalny most FFmpeg zwrocil status HTTP 500."
    );
  });
});