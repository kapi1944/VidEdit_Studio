import { blad, sukces, type Wynik } from "../../wspolne/wynik";
import type { BladWalidacji } from "../../wspolne/bledy";
import type {
  DaneImportuPlikuMediow,
  PlikMediow,
  TypPlikuMediow
} from "./typyMediow";
import {
  okreslTypMediowPoRozszerzeniu,
  pobierzRozszerzeniePliku
} from "./rozszerzeniaWideo";
import { sprawdzCzyDaneImportuMediowSaPoprawne } from "./walidacjaMediow";

function utworzIdPlikuMediow(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `media-${Date.now()}`;
}

function utworzBladNieobslugiwanegoFormatu(): BladWalidacji {
  return {
    pole: "rozszerzenie",
    komunikat: "Nieobslugiwany format pliku."
  };
}

function utworzPlikMediow(
  daneImportu: DaneImportuPlikuMediow,
  typMediow: TypPlikuMediow,
  rozszerzenie: string
): PlikMediow {
  return {
    id: daneImportu.id ?? utworzIdPlikuMediow(),
    nazwaPliku: daneImportu.nazwaPliku.trim(),
    sciezkaPliku: daneImportu.sciezkaPliku.trim(),
    rozszerzenie,
    typMime: daneImportu.typMime?.trim() ?? "",
    rozmiarBajtow: daneImportu.rozmiarBajtow,
    statusImportu: daneImportu.statusImportu ?? "zaimportowany",
    typ: typMediow,
    ...(daneImportu.dataModyfikacjiPlikuIso
      ? { dataModyfikacjiPlikuIso: daneImportu.dataModyfikacjiPlikuIso }
      : {}),
    czasTrwaniaMs: daneImportu.czasTrwaniaMs
  };
}

export function utworzPlikMediowZDanychImportu(
  daneImportu: DaneImportuPlikuMediow
): Wynik<PlikMediow, BladWalidacji> {
  const bledy = sprawdzCzyDaneImportuMediowSaPoprawne(daneImportu);

  if (bledy.length > 0) {
    return blad(bledy);
  }

  const rozszerzenie =
    daneImportu.rozszerzenie?.trim() ||
    pobierzRozszerzeniePliku(daneImportu.nazwaPliku);
  const typMediow = okreslTypMediowPoRozszerzeniu(rozszerzenie);

  if (!typMediow) {
    return blad(utworzBladNieobslugiwanegoFormatu());
  }

  return sukces(utworzPlikMediow(daneImportu, typMediow, rozszerzenie));
}

export function utworzPlikWideoZDanychImportu(
  daneImportu: DaneImportuPlikuMediow
): Wynik<PlikMediow, BladWalidacji> {
  const wynik = utworzPlikMediowZDanychImportu(daneImportu);

  if (!wynik.czySukces) {
    return wynik;
  }

  if (wynik.dane.typ !== "wideo") {
    return blad(utworzBladNieobslugiwanegoFormatu());
  }

  return wynik;
}
