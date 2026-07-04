import type { BladWalidacji } from "../../wspolne/bledy";
import { sprawdzCzyCzasJestPoprawny } from "../projekt/walidacjaProjektu";
import type { MetadaneWideo } from "./typyMediow";

export function zwalidujMetadaneWideo(
  metadane: MetadaneWideo
): BladWalidacji[] {
  const bledy: BladWalidacji[] = [];

  if (metadane.czasTrwaniaMs !== undefined) {
    bledy.push(
      ...sprawdzCzyCzasJestPoprawny(metadane.czasTrwaniaMs).map((blad) => ({
        ...blad,
        pole: "czasTrwaniaMs"
      }))
    );
  }

  if (
    metadane.szerokoscPx !== undefined &&
    !Number.isFinite(metadane.szerokoscPx)
  ) {
    bledy.push({
      pole: "szerokoscPx",
      komunikat: "Szerokość wideo musi być skończoną liczbą."
    });
  }

  if (
    metadane.wysokoscPx !== undefined &&
    !Number.isFinite(metadane.wysokoscPx)
  ) {
    bledy.push({
      pole: "wysokoscPx",
      komunikat: "Wysokość wideo musi być skończoną liczbą."
    });
  }

  if (metadane.szerokoscPx === 0 && metadane.wysokoscPx === 0) {
    bledy.push({
      pole: "rozdzielczosc",
      komunikat: "Rozdzielczość wideo musi być większa od zera."
    });
  } else {
    if (metadane.szerokoscPx !== undefined && metadane.szerokoscPx <= 0) {
      bledy.push({
        pole: "szerokoscPx",
        komunikat: "Szerokość wideo musi być większa od zera."
      });
    }

    if (metadane.wysokoscPx !== undefined && metadane.wysokoscPx <= 0) {
      bledy.push({
        pole: "wysokoscPx",
        komunikat: "Wysokość wideo musi być większa od zera."
      });
    }
  }

  return bledy;
}
