export type { SciezkaAudio } from "../../domena/audio/typyAudio";

export type KodBleduWyodrebnianiaAudio =
  | "brak_sciezki_zrodlowej"
  | "brak_katalogu_roboczego"
  | "plik_bez_audio"
  | "ffmpeg_niedostepny"
  | "blad_ffmpeg";

export class BladWyodrebnianiaAudio extends Error {
  readonly kod: KodBleduWyodrebnianiaAudio;
  readonly szczegoly?: string;

  constructor(
    kod: KodBleduWyodrebnianiaAudio,
    komunikat: string,
    szczegoly?: string
  ) {
    super(komunikat);
    this.name = "BladWyodrebnianiaAudio";
    this.kod = kod;
    this.szczegoly = szczegoly;
  }
}
