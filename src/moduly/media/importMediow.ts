import type { BladWalidacji } from "../../wspolne/bledy";
import type { Wynik } from "../../wspolne/wynik";
import { utworzPlikWideoZDanychImportu } from "../../domena/media/fabrykaMediow";
import type {
  DaneImportuPlikuMediow,
  PlikMediow
} from "../../domena/media/typyMediow";

export function zaimportujPlikMediow(
  daneImportu: DaneImportuPlikuMediow
): Wynik<PlikMediow, BladWalidacji> {
  return utworzPlikWideoZDanychImportu(daneImportu);
}
