import type { DaneImportuPlikuMediow } from "../../domena/media/typyMediow";

export function utworzDaneImportuZPlikuBrowserowego(
  plik: File
): DaneImportuPlikuMediow {
  return {
    nazwaPliku: plik.name,
    sciezkaPliku: plik.name,
    typMime: plik.type,
    rozmiarBajtow: plik.size
  };
}
