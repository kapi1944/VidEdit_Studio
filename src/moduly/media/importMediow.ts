import type { BladWalidacji } from "../../wspolne/bledy";
import { blad, type Wynik } from "../../wspolne/wynik";
import { utworzPlikWideoZDanychImportu } from "../../domena/media/fabrykaMediow";
import { pobierzRozszerzeniePliku } from "../../domena/media/rozszerzeniaWideo";
import type { PlikMediow } from "../../domena/media/typyMediow";
import { walidujPlikMediow } from "../../domena/media/walidacjaMediow";

export function utworzUrlPodgladu(plik: File): string {
  return URL.createObjectURL(plik);
}

export function zaimportujPlikMediow(
  plik: File | null
): Wynik<PlikMediow, BladWalidacji> {
  const bledyWalidacji = walidujPlikMediow(plik);

  if (bledyWalidacji.length > 0) {
    return blad(bledyWalidacji);
  }

  if (!plik) {
    return blad({
      pole: "plik",
      komunikat: "Nie wybrano pliku."
    });
  }

  try {
    const objectUrl = utworzUrlPodgladu(plik);

    return utworzPlikWideoZDanychImportu({
      nazwaPliku: plik.name,
      rozszerzenie: pobierzRozszerzeniePliku(plik.name),
      typMime: plik.type,
      rozmiarBajtow: plik.size,
      objectUrl,
      dataModyfikacjiPlikuIso: new Date(plik.lastModified).toISOString()
    });
  } catch {
    return blad({
      pole: "plik",
      komunikat: "Nie udało się zaimportować pliku."
    });
  }
}
