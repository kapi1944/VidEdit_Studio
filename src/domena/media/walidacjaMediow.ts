import type { BladWalidacji } from "../../wspolne/bledy";
import { sprawdzCzyCzasJestPoprawny } from "../projekt/walidacjaProjektu";
import type {
  DaneImportuPlikuMediow,
  PlikDoWalidacjiMediow
} from "./typyMediow";
import {
  pobierzRozszerzeniePliku,
  sprawdzCzyRozszerzenieMediowJestObslugiwane
} from "./rozszerzeniaWideo";

export function walidujPlikMediow(
  plik: PlikDoWalidacjiMediow | null | undefined
): BladWalidacji[] {
  if (!plik) {
    return [
      {
        pole: "plik",
        komunikat: "Nie wybrano pliku."
      }
    ];
  }

  const bledy: BladWalidacji[] = [];
  const rozszerzenie = pobierzRozszerzeniePliku(plik.name);

  if (!sprawdzCzyRozszerzenieMediowJestObslugiwane(rozszerzenie)) {
    bledy.push({
      pole: "rozszerzenie",
      komunikat: "Nieobsługiwany format pliku."
    });
  }

  if (!Number.isInteger(plik.size) || plik.size <= 0) {
    bledy.push({
      pole: "rozmiarBajtow",
      komunikat: "Plik jest pusty."
    });
  }

  return bledy;
}

export function sprawdzCzyDaneImportuMediowSaPoprawne(
  daneImportu: DaneImportuPlikuMediow
): BladWalidacji[] {
  const bledy: BladWalidacji[] = [];
  const nazwaPliku = daneImportu.nazwaPliku.trim();
  const sciezkaPliku = daneImportu.sciezkaPliku.trim();

  if (nazwaPliku.length === 0) {
    bledy.push({
      pole: "nazwaPliku",
      komunikat: "Nie wybrano pliku."
    });
  }

  if (sciezkaPliku.length === 0) {
    bledy.push({
      pole: "sciezkaPliku",
      komunikat: "Brak identyfikatora pliku."
    });
  }

  if (nazwaPliku.length > 0) {
    const rozszerzenie = pobierzRozszerzeniePliku(nazwaPliku);

    if (!sprawdzCzyRozszerzenieMediowJestObslugiwane(rozszerzenie)) {
      bledy.push({
        pole: "rozszerzenie",
        komunikat: "Nieobsługiwany format pliku."
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

  if (!Number.isInteger(daneImportu.rozmiarBajtow) || daneImportu.rozmiarBajtow <= 0) {
    bledy.push({
      pole: "rozmiarBajtow",
      komunikat: "Plik jest pusty."
    });
  }

  return bledy;
}
