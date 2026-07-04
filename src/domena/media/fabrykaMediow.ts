import { blad, sukces, type Wynik } from "../../wspolne/wynik";
import type { BladWalidacji } from "../../wspolne/bledy";
import type { DaneImportuPlikuMediow, PlikMediow } from "./typyMediow";
import { pobierzRozszerzeniePliku } from "./rozszerzeniaWideo";
import { sprawdzCzyDaneImportuMediowSaPoprawne } from "./walidacjaMediow";

function utworzIdPlikuMediow(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `media-${Date.now()}`;
}

export function utworzPlikWideoZDanychImportu(
  daneImportu: DaneImportuPlikuMediow
): Wynik<PlikMediow, BladWalidacji> {
  const bledy = sprawdzCzyDaneImportuMediowSaPoprawne(daneImportu);

  if (bledy.length > 0) {
    return blad(bledy);
  }

  return sukces({
    id: daneImportu.id ?? utworzIdPlikuMediow(),
    nazwaPliku: daneImportu.nazwaPliku.trim(),
    sciezkaPliku: daneImportu.sciezkaPliku.trim(),
    rozszerzenie:
      daneImportu.rozszerzenie?.trim() ||
      pobierzRozszerzeniePliku(daneImportu.nazwaPliku),
    typMime: daneImportu.typMime?.trim() ?? "",
    rozmiarBajtow: daneImportu.rozmiarBajtow,
    statusImportu: daneImportu.statusImportu ?? "zaimportowany",
    typ: "wideo",
    ...(daneImportu.dataModyfikacjiPlikuIso
      ? { dataModyfikacjiPlikuIso: daneImportu.dataModyfikacjiPlikuIso }
      : {}),
    czasTrwaniaMs: daneImportu.czasTrwaniaMs
  });
}
