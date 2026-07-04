export type WynikSprawdzeniaFfmpeg = {
  czyFfmpegDostepny: boolean;
  czyFfprobeDostepny: boolean;
  wersjaFfmpeg?: string;
  wersjaFfprobe?: string;
  bledy: string[];
};

export type WynikProcesuFfmpeg = {
  kodWyjscia: number;
  stdout: string;
  stderr: string;
};

export type UruchomProcesFfmpeg = (
  polecenie: string,
  argumenty: string[]
) => Promise<WynikProcesuFfmpeg>;
