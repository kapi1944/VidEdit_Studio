import type { PlikMediow } from "../../domena/media/typyMediow";
import { zbudujKomendeWyodrebnianiaAudio } from "../../infrastruktura/ffmpeg/komendyAudio";
import type { WykonajKomendeFfmpeg } from "../../infrastruktura/ffmpeg/wykonajKomendeFfmpeg";
import { DOMYSLNE_USTAWIENIA_AUDIO } from "./ustawieniaAudio";
import { BladWyodrebnianiaAudio, type SciezkaAudio } from "./typyAudio";

export async function wyodrebnijAudio(parametry: {
  plikMediow: PlikMediow;
  katalogRoboczy: string;
  wykonajKomendeFfmpeg: WykonajKomendeFfmpeg;
  utworzId?: () => string;
}): Promise<SciezkaAudio> {
  const { plikMediow, katalogRoboczy, wykonajKomendeFfmpeg, utworzId } =
    parametry;

  sprawdzCzyMoznaWyodrebnicAudio(plikMediow, katalogRoboczy);

  const sciezkaPlikuZrodlowego = plikMediow.sciezkaPliku.trim();
  const idAudio = utworzId?.() ?? `audio_${oczyscCzlonNazwyPliku(plikMediow.id)}`;
  const sciezkaPlikuAudio = polaczSciezke(
    katalogRoboczy.trim(),
    `${oczyscCzlonNazwyPliku(idAudio)}.${DOMYSLNE_USTAWIENIA_AUDIO.format}`
  );
  const komenda = zbudujKomendeWyodrebnianiaAudio({
    sciezkaPlikuZrodlowego,
    sciezkaPlikuAudio,
    liczbaKanalow: DOMYSLNE_USTAWIENIA_AUDIO.liczbaKanalow,
    probkowanieHz: DOMYSLNE_USTAWIENIA_AUDIO.probkowanieHz
  });

  let wynikKomendy;

  try {
    wynikKomendy = await wykonajKomendeFfmpeg(komenda);
  } catch (blad) {
    throw utworzBladWykonaniaKomendy(blad);
  }

  if (wynikKomendy.kodWyjscia !== 0) {
    throw new BladWyodrebnianiaAudio(
      "blad_ffmpeg",
      "Nie udalo sie wyodrebnic audio przez FFmpeg.",
      wynikKomendy.stderr || wynikKomendy.stdout
    );
  }

  return {
    id: idAudio,
    sciezkaPlikuZrodlowego,
    sciezkaPlikuAudio,
    czasTrwaniaMs: pobierzCzasTrwaniaAudio(plikMediow),
    format: DOMYSLNE_USTAWIENIA_AUDIO.format,
    liczbaKanalow: DOMYSLNE_USTAWIENIA_AUDIO.liczbaKanalow,
    probkowanieHz: DOMYSLNE_USTAWIENIA_AUDIO.probkowanieHz
  };
}

function sprawdzCzyMoznaWyodrebnicAudio(
  plikMediow: PlikMediow,
  katalogRoboczy: string
) {
  if (plikMediow.sciezkaPliku.trim().length === 0) {
    throw new BladWyodrebnianiaAudio(
      "brak_sciezki_zrodlowej",
      "Nie mozna wyodrebnic audio, poniewaz plik mediow nie ma sciezki zrodlowej."
    );
  }

  if (katalogRoboczy.trim().length === 0) {
    throw new BladWyodrebnianiaAudio(
      "brak_katalogu_roboczego",
      "Nie mozna wyodrebnic audio, poniewaz brakuje katalogu roboczego."
    );
  }

  if (plikMediow.metadane?.liczbaSciezekAudio === 0) {
    throw new BladWyodrebnianiaAudio(
      "plik_bez_audio",
      "Nie mozna wyodrebnic audio, poniewaz plik nie zawiera sciezki audio."
    );
  }
}

function pobierzCzasTrwaniaAudio(plikMediow: PlikMediow): number {
  return plikMediow.metadane?.czasTrwaniaMs ?? plikMediow.czasTrwaniaMs ?? 0;
}

function polaczSciezke(katalogRoboczy: string, nazwaPliku: string): string {
  if (katalogRoboczy === "/" || katalogRoboczy === "\\") {
    return `${katalogRoboczy}${nazwaPliku}`;
  }

  if (/^[a-zA-Z]:[\\/]?$/.test(katalogRoboczy)) {
    return `${katalogRoboczy.replace(/[\\/]*$/, "\\")}${nazwaPliku}`;
  }

  const separator = katalogRoboczy.includes("\\") ? "\\" : "/";
  const katalogBezSeparatora = katalogRoboczy.replace(/[\\/]+$/, "");

  return `${katalogBezSeparatora}${separator}${nazwaPliku}`;
}

function oczyscCzlonNazwyPliku(wartosc: string): string {
  const oczyszczonaWartosc = wartosc
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return oczyszczonaWartosc || "audio";
}

function utworzBladWykonaniaKomendy(blad: unknown): BladWyodrebnianiaAudio {
  if (czyBrakNarzedzia(blad)) {
    return new BladWyodrebnianiaAudio(
      "ffmpeg_niedostepny",
      "FFmpeg nie jest dostepny albo nie udalo sie go uruchomic.",
      pobierzSzczegolyBledu(blad)
    );
  }

  return new BladWyodrebnianiaAudio(
    "blad_ffmpeg",
    "Nie udalo sie wyodrebnic audio przez FFmpeg.",
    pobierzSzczegolyBledu(blad)
  );
}

function czyBrakNarzedzia(blad: unknown): boolean {
  return (
    typeof blad === "object" &&
    blad !== null &&
    "code" in blad &&
    blad.code === "ENOENT"
  );
}

function pobierzSzczegolyBledu(blad: unknown): string | undefined {
  if (blad instanceof Error) {
    return blad.message;
  }

  if (typeof blad === "string") {
    return blad;
  }

  return undefined;
}
