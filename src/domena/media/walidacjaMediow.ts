import type { BladWalidacji } from "../../wspolne/bledy";
import { sprawdzCzyCzasJestPoprawny } from "../projekt/walidacjaProjektu";
import type { DaneImportuPlikuMediow } from "./typyMediow";
import {
  pobierzRozszerzeniePliku,
  sprawdzCzyRozszerzenieWideoJestObslugiwane
} from "./rozszerzeniaWideo";

export function sprawdzCzyDaneImportuMediowSaPoprawne(
  daneImportu: DaneImportuPlikuMediow
): BladWalidacji[] {
  const bledy: BladWalidacji[] = [];
  const nazwaPliku = daneImportu.nazwaPliku.trim();
  const sciezkaPliku = daneImportu.sciezkaPliku.trim();

  if (nazwaPliku.length === 0) {
    bledy.push({
      pole: "nazwaPliku",
      komunikat: "Nazwa pliku mediów nie może być pusta."
    });
  }

  if (sciezkaPliku.length === 0) {
    bledy.push({
      pole: "sciezkaPliku",
      komunikat: "Ścieżka pliku mediów nie może być pusta."
    });
  }

  if (nazwaPliku.length > 0) {
    const rozszerzenie = pobierzRozszerzeniePliku(nazwaPliku);

    if (!sprawdzCzyRozszerzenieWideoJestObslugiwane(rozszerzenie)) {
      bledy.push({
        pole: "rozszerzenie",
        komunikat: "Format pliku wideo nie jest obsługiwany."
      });
    }
  }

  if (daneImportu.czasTrwaniaMs !== undefined) {
    bledy.push(
      ...sprawdzCzyCzasJestPoprawny(daneImportu.czasTrwaniaMs).map((blad) => ({
        ...blad,
        pole: "czasTrwaniaMs"
      }))
    );
  }

  if (
    daneImportu.rozmiarBajtow !== undefined &&
    (!Number.isInteger(daneImportu.rozmiarBajtow) ||
      daneImportu.rozmiarBajtow <= 0)
  ) {
    bledy.push({
      pole: "rozmiarBajtow",
      komunikat: "Rozmiar pliku musi być liczbą całkowitą większą od zera."
    });
  }

  return bledy;
}
