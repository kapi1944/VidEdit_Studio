import type { CzasMs, LiczbaKlatekNaSekunde } from "./typyCzasu";

function sprawdzLiczbeKlatekNaSekunde(
  liczbaKlatekNaSekunde: LiczbaKlatekNaSekunde
) {
  if (
    !Number.isFinite(liczbaKlatekNaSekunde) ||
    liczbaKlatekNaSekunde <= 0
  ) {
    throw new Error("Liczba klatek na sekundę musi być większa od zera.");
  }
}

export function przeliczMsNaKlatke(
  czasMs: CzasMs,
  liczbaKlatekNaSekunde: LiczbaKlatekNaSekunde
): number {
  sprawdzLiczbeKlatekNaSekunde(liczbaKlatekNaSekunde);
  return Math.floor((czasMs / 1000) * liczbaKlatekNaSekunde);
}

export function przeliczKlatkeNaMs(
  numerKlatki: number,
  liczbaKlatekNaSekunde: LiczbaKlatekNaSekunde
): CzasMs {
  sprawdzLiczbeKlatekNaSekunde(liczbaKlatekNaSekunde);
  return Math.round((numerKlatki / liczbaKlatekNaSekunde) * 1000);
}
