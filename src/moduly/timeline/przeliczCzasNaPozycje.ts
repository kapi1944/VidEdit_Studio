import type { CzasMs } from "../../domena/czas/typyCzasu";
import type { PolozenieZakresuOsiCzasu } from "./typyTimeline";

function czyCzasTrwaniaJestNiepoprawny(czasTrwaniaMs: CzasMs): boolean {
  return !Number.isFinite(czasTrwaniaMs) || czasTrwaniaMs <= 0;
}

function ograniczDoZakresu(wartosc: number, minimum: number, maksimum: number) {
  return Math.min(Math.max(wartosc, minimum), maksimum);
}

export function ograniczCzasDoZakresu(
  czasMs: CzasMs,
  czasTrwaniaMs: CzasMs
): CzasMs {
  if (!Number.isFinite(czasMs)) {
    return 0;
  }

  if (czyCzasTrwaniaJestNiepoprawny(czasTrwaniaMs)) {
    return 0;
  }

  return ograniczDoZakresu(czasMs, 0, czasTrwaniaMs);
}

export function przeliczPozycjeNaCzas(
  pozycjaX: number,
  szerokoscTimeline: number,
  czasTrwaniaMs: CzasMs
): CzasMs {
  if (
    !Number.isFinite(pozycjaX) ||
    !Number.isFinite(szerokoscTimeline) ||
    szerokoscTimeline <= 0 ||
    czyCzasTrwaniaJestNiepoprawny(czasTrwaniaMs)
  ) {
    return 0;
  }

  const pozycjaWZakresie = ograniczDoZakresu(
    pozycjaX,
    0,
    szerokoscTimeline
  );

  return (pozycjaWZakresie / szerokoscTimeline) * czasTrwaniaMs;
}

export function przeliczCzasNaProcent(
  czasMs: CzasMs,
  czasTrwaniaMs: CzasMs
): number {
  if (czyCzasTrwaniaJestNiepoprawny(czasTrwaniaMs)) {
    return 0;
  }

  const czasWZakresieMs = ograniczCzasDoZakresu(czasMs, czasTrwaniaMs);

  return (czasWZakresieMs / czasTrwaniaMs) * 100;
}

export function przeliczCzasNaPozycje(
  czasMs: CzasMs,
  czasTrwaniaMs: CzasMs
): number {
  return przeliczCzasNaProcent(czasMs, czasTrwaniaMs);
}

export function przeliczZakresCzasuNaPolozenie(
  czasPoczatkuMs: CzasMs,
  czasKoncaMs: CzasMs,
  czasTrwaniaMs: CzasMs
): PolozenieZakresuOsiCzasu {
  if (
    czyCzasTrwaniaJestNiepoprawny(czasTrwaniaMs) ||
    !Number.isFinite(czasPoczatkuMs) ||
    !Number.isFinite(czasKoncaMs)
  ) {
    return {
      polozenieOdLewejProcent: 0,
      szerokoscProcent: 0
    };
  }

  const czasPoczatkuWZakresieMs = ograniczDoZakresu(
    czasPoczatkuMs,
    0,
    czasTrwaniaMs
  );
  const czasKoncaWZakresieMs = ograniczDoZakresu(
    czasKoncaMs,
    0,
    czasTrwaniaMs
  );
  const czasKoncaPoPoczatkuMs = Math.max(
    czasKoncaWZakresieMs,
    czasPoczatkuWZakresieMs
  );

  return {
    polozenieOdLewejProcent: przeliczCzasNaPozycje(
      czasPoczatkuWZakresieMs,
      czasTrwaniaMs
    ),
    szerokoscProcent:
      ((czasKoncaPoPoczatkuMs - czasPoczatkuWZakresieMs) / czasTrwaniaMs) *
      100
  };
}
