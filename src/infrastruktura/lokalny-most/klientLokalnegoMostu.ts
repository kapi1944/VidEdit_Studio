export const adresStatusuFfmpegLokalnegoMostu = "http://127.0.0.1:5181/api/ffmpeg/status";

export type StatusFfmpegLokalnegoMostu = {
  czyFfmpegDostepny: boolean;
  czyFfprobeDostepny: boolean;
  wersjaFfmpeg: string | null;
  wersjaFfprobe: string | null;
  blad: string | null;
};

export class BladLokalnegoMostu extends Error {
  constructor(komunikat: string, opcje?: ErrorOptions) {
    super(komunikat, opcje);
    this.name = "BladLokalnegoMostu";
  }
}

export async function pobierzStatusFfmpegZLokalnegoMostu(): Promise<StatusFfmpegLokalnegoMostu> {
  try {
    const odpowiedz = await fetch(adresStatusuFfmpegLokalnegoMostu);

    if (!odpowiedz.ok) {
      throw new BladLokalnegoMostu(
        `Lokalny most FFmpeg zwrocil status HTTP ${odpowiedz.status}.`
      );
    }

    return (await odpowiedz.json()) as StatusFfmpegLokalnegoMostu;
  } catch (blad) {
    if (blad instanceof BladLokalnegoMostu) {
      throw blad;
    }

    throw new BladLokalnegoMostu(
      "Nie udalo sie polaczyc z lokalnym mostem FFmpeg. Sprawdz, czy uruchomiono npm run dev:most.",
      { cause: blad }
    );
  }
}