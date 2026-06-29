import type {
  CzasMs,
  FormatWyswietlaniaCzasu,
  LiczbaKlatekNaSekunde
} from "./typyCzasu";
import { przeliczMsNaKlatke } from "./przeliczanieKlatek";

function uzupelnijLiczbe(wartosc: number, dlugosc: number) {
  return String(wartosc).padStart(dlugosc, "0");
}

function formatujCzasZlozony(czasMs: CzasMs) {
  const godziny = Math.floor(czasMs / 3_600_000);
  const minuty = Math.floor((czasMs % 3_600_000) / 60_000);
  const sekundy = Math.floor((czasMs % 60_000) / 1000);
  const milisekundy = Math.floor(czasMs % 1000);

  return `${uzupelnijLiczbe(godziny, 2)}:${uzupelnijLiczbe(
    minuty,
    2
  )}:${uzupelnijLiczbe(sekundy, 2)}.${uzupelnijLiczbe(milisekundy, 3)}`;
}

export function formatujCzas(
  czasMs: CzasMs,
  format: FormatWyswietlaniaCzasu,
  liczbaKlatekNaSekunde?: LiczbaKlatekNaSekunde
): string {
  if (format === "sekundy") {
    return `${Number((czasMs / 1000).toFixed(3))} s`;
  }

  if (format === "czas") {
    return formatujCzasZlozony(czasMs);
  }

  if (format === "klatki") {
    if (liczbaKlatekNaSekunde === undefined) {
      throw new Error("Format klatek wymaga liczby klatek na sekundę.");
    }

    return `klatka ${przeliczMsNaKlatke(czasMs, liczbaKlatekNaSekunde)}`;
  }

  const niewyczerpanyFormat: never = format;
  return niewyczerpanyFormat;
}
