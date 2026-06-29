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
