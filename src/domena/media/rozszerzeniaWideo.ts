import type { TypPlikuMediow } from "./typyMediow";

export const OBSLUGIWANE_ROZSZERZENIA_WIDEO = [
  ".mp4",
  ".mov",
  ".mkv",
  ".webm",
  ".avi",
  ".m4v"
] as const;

export type RozszerzenieWideo =
  (typeof OBSLUGIWANE_ROZSZERZENIA_WIDEO)[number];

export const OBSLUGIWANE_ROZSZERZENIA_GRAFIK = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif"
] as const;

export type RozszerzenieGrafiki =
  (typeof OBSLUGIWANE_ROZSZERZENIA_GRAFIK)[number];

export const OBSLUGIWANE_ROZSZERZENIA_MEDIOW = [
  ...OBSLUGIWANE_ROZSZERZENIA_WIDEO,
  ...OBSLUGIWANE_ROZSZERZENIA_GRAFIK
] as const;

export type RozszerzenieMediow =
  (typeof OBSLUGIWANE_ROZSZERZENIA_MEDIOW)[number];

export function pobierzRozszerzeniePliku(nazwaPliku: string): string {
  const indeksKropki = nazwaPliku.lastIndexOf(".");

  if (indeksKropki < 0) {
    return "";
  }

  return nazwaPliku.slice(indeksKropki).toLowerCase();
}

export function sprawdzCzyRozszerzenieWideoJestObslugiwane(
  rozszerzenie: string
): boolean {
  return OBSLUGIWANE_ROZSZERZENIA_WIDEO.includes(
    rozszerzenie.toLowerCase() as RozszerzenieWideo
  );
}

export function sprawdzCzyRozszerzenieGrafikiJestObslugiwane(
  rozszerzenie: string
): boolean {
  return OBSLUGIWANE_ROZSZERZENIA_GRAFIK.includes(
    rozszerzenie.toLowerCase() as RozszerzenieGrafiki
  );
}

export function sprawdzCzyRozszerzenieMediowJestObslugiwane(
  rozszerzenie: string
): boolean {
  return OBSLUGIWANE_ROZSZERZENIA_MEDIOW.includes(
    rozszerzenie.toLowerCase() as RozszerzenieMediow
  );
}

export function okreslTypMediowPoRozszerzeniu(
  rozszerzenie: string
): TypPlikuMediow | undefined {
  if (sprawdzCzyRozszerzenieWideoJestObslugiwane(rozszerzenie)) {
    return "wideo";
  }

  if (sprawdzCzyRozszerzenieGrafikiJestObslugiwane(rozszerzenie)) {
    return "grafika";
  }

  return undefined;
}
