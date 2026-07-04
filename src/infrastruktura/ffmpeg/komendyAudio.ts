export type KomendaWyodrebnianiaAudio = {
  program: "ffmpeg";
  argumenty: string[];
};

export function zbudujKomendeWyodrebnianiaAudio(parametry: {
  sciezkaPlikuZrodlowego: string;
  sciezkaPlikuAudio: string;
  liczbaKanalow: number;
  probkowanieHz: number;
}): KomendaWyodrebnianiaAudio {
  return {
    program: "ffmpeg",
    argumenty: [
      "-y",
      "-i",
      parametry.sciezkaPlikuZrodlowego,
      "-vn",
      "-ac",
      String(parametry.liczbaKanalow),
      "-ar",
      String(parametry.probkowanieHz),
      "-f",
      "wav",
      parametry.sciezkaPlikuAudio
    ]
  };
}
