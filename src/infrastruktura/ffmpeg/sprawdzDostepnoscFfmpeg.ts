import type {
  UruchomProcesFfmpeg,
  WynikProcesuFfmpeg,
  WynikSprawdzeniaFfmpeg
} from "./typyFfmpeg";
import { uruchomProcesFfmpeg } from "./uruchomProcesFfmpeg";

type NazwaNarzedziaFfmpeg = "ffmpeg" | "ffprobe";

type WynikNarzedziaFfmpeg = {
  czyDostepny: boolean;
  wersja?: string;
  bledy: string[];
};

export async function sprawdzDostepnoscFfmpeg(
  uruchomProces: UruchomProcesFfmpeg = uruchomProcesFfmpeg
): Promise<WynikSprawdzeniaFfmpeg> {
  const wynikFfmpeg = await sprawdzNarzedzieFfmpeg("ffmpeg", uruchomProces);
  const wynikFfprobe = await sprawdzNarzedzieFfmpeg("ffprobe", uruchomProces);

  return {
    czyFfmpegDostepny: wynikFfmpeg.czyDostepny,
    czyFfprobeDostepny: wynikFfprobe.czyDostepny,
    wersjaFfmpeg: wynikFfmpeg.wersja,
    wersjaFfprobe: wynikFfprobe.wersja,
    bledy: [...wynikFfmpeg.bledy, ...wynikFfprobe.bledy]
  };
}

async function sprawdzNarzedzieFfmpeg(
  narzedzie: NazwaNarzedziaFfmpeg,
  uruchomProces: UruchomProcesFfmpeg
): Promise<WynikNarzedziaFfmpeg> {
  try {
    const wynikProcesu = await uruchomProces(narzedzie, ["-version"]);

    if (wynikProcesu.kodWyjscia !== 0) {
      return {
        czyDostepny: false,
        bledy: [`Nie udalo sie uruchomic ${narzedzie} -version.`]
      };
    }

    return {
      czyDostepny: true,
      wersja: pobierzWersjeNarzedzia(wynikProcesu),
      bledy: []
    };
  } catch (blad) {
    return {
      czyDostepny: false,
      bledy: [utworzKomunikatBledu(narzedzie, blad)]
    };
  }
}

function pobierzWersjeNarzedzia(
  wynikProcesu: WynikProcesuFfmpeg
): string | undefined {
  const tekstWyniku = `${wynikProcesu.stdout}\n${wynikProcesu.stderr}`;

  return tekstWyniku
    .split(/\r?\n/)
    .map((linia) => linia.trim())
    .find(Boolean);
}

function utworzKomunikatBledu(
  narzedzie: NazwaNarzedziaFfmpeg,
  blad: unknown
): string {
  if (czyBrakNarzedzia(blad)) {
    return narzedzie === "ffmpeg"
      ? "Nie znaleziono narzedzia ffmpeg. Sprawdz, czy FFmpeg jest zainstalowany i dostepny w zmiennej PATH."
      : "Nie znaleziono narzedzia ffprobe. Sprawdz, czy FFprobe jest zainstalowany i dostepny w zmiennej PATH.";
  }

  return `Nie udalo sie uruchomic ${narzedzie} -version.`;
}

function czyBrakNarzedzia(blad: unknown): boolean {
  return (
    typeof blad === "object" &&
    blad !== null &&
    "code" in blad &&
    blad.code === "ENOENT"
  );
}
