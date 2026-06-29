import type { WynikSprawdzeniaFfmpeg } from "./portFfmpeg";

export async function sprawdzDostepnoscFfmpeg(): Promise<WynikSprawdzeniaFfmpeg> {
  return {
    czyDostepny: false,
    komunikat: "Integracja z FFmpeg zostanie dodana w kolejnym etapie."
  };
}
