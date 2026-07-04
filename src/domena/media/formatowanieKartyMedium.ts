import type { PlikMediow } from "./typyMediow";

export type DaneKartyMedium = {
  nazwaPliku: string;
  typPliku: string;
  czasTrwania: string;
  rozdzielczosc: string;
  fps: string;
  audio: string;
  status: string;
};

export function pobierzCzasTrwaniaMedium(
  plikMediow: PlikMediow
): number | undefined {
  return plikMediow.metadane?.czasTrwaniaMs ?? plikMediow.czasTrwaniaMs;
}

export function formatujCzasTrwaniaMedium(
  czasTrwaniaMs: number | undefined
): string {
  if (czasTrwaniaMs === undefined) {
    return "brak";
  }

  const laczneSekundy = Math.round(czasTrwaniaMs / 1000);
  const sekundy = laczneSekundy % 60;
  const laczneMinuty = Math.floor(laczneSekundy / 60);
  const minuty = laczneMinuty % 60;
  const godziny = Math.floor(laczneMinuty / 60);

  return `${String(godziny).padStart(2, "0")}:${String(minuty).padStart(
    2,
    "0"
  )}:${String(sekundy).padStart(2, "0")}`;
}

export function formatujRozdzielczoscMedium(
  plikMediow: PlikMediow
): string {
  const szerokosc =
    plikMediow.metadane?.szerokoscPx ?? plikMediow.szerokoscWideo;
  const wysokosc = plikMediow.metadane?.wysokoscPx ?? plikMediow.wysokoscWideo;

  if (szerokosc === undefined || wysokosc === undefined) {
    return "brak";
  }

  return `${szerokosc} x ${wysokosc}`;
}

export function formatujFpsMedium(plikMediow: PlikMediow): string {
  const fps = plikMediow.metadane?.liczbaKlatekNaSekunde;

  if (fps === undefined) {
    return "nieustalone";
  }

  return Number.isInteger(fps)
    ? String(fps)
    : fps.toFixed(2).replace(/\.?0+$/, "");
}

export function formatujAudioMedium(plikMediow: PlikMediow): string {
  const liczbaSciezekAudio = plikMediow.metadane?.liczbaSciezekAudio;

  if (liczbaSciezekAudio === undefined) {
    return "do sprawdzenia";
  }

  if (liczbaSciezekAudio === 0) {
    return "brak";
  }

  if (liczbaSciezekAudio === 1) {
    return "1 sciezka";
  }

  return `${liczbaSciezekAudio} sciezki`;
}

export function formatujTypPlikuMedium(plikMediow: PlikMediow): string {
  return plikMediow.typMime || plikMediow.rozszerzenie || plikMediow.typ;
}

export function utworzDaneKartyMedium(
  plikMediow: PlikMediow,
  status?: string
): DaneKartyMedium {
  return {
    nazwaPliku: plikMediow.nazwaPliku,
    typPliku: formatujTypPlikuMedium(plikMediow),
    czasTrwania: formatujCzasTrwaniaMedium(pobierzCzasTrwaniaMedium(plikMediow)),
    rozdzielczosc: formatujRozdzielczoscMedium(plikMediow),
    fps: formatujFpsMedium(plikMediow),
    audio: formatujAudioMedium(plikMediow),
    status: status ?? "gotowe"
  };
}
