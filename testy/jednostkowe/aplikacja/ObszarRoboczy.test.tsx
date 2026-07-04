import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  ObszarRoboczy
} from "../../../src/aplikacja/komponenty/AplikacjaVidEdit";
import { utworzTekstCzasuPodgladu } from "../../../src/aplikacja/komponenty/PodgladWideo";
import { formatujCzas } from "../../../src/domena/czas/formatowanieCzasu";
import type { PlikMediow } from "../../../src/domena/media/typyMediow";

const plikWideo: PlikMediow = {
  id: "medium-1",
  nazwaPliku: "lekcja.mp4",
  sciezkaPliku: "",
  rozszerzenie: ".mp4",
  typMime: "video/mp4",
  rozmiarBajtow: 1024,
  statusImportu: "zaimportowany",
  typ: "wideo",
  metadane: {
    czasTrwaniaMs: 9334,
    szerokoscPx: 1920,
    wysokoscPx: 1080,
    liczbaKlatekNaSekunde: 25,
    liczbaSciezekAudio: 1,
    czyMetadanePelne: true
  }
};

function formatujCzasTestowy(czasMs: number) {
  return formatujCzas(czasMs, "czas");
}

function wyrenderujObszarRoboczy(
  wlasciwosci: Partial<Parameters<typeof ObszarRoboczy>[0]> = {}
) {
  return renderToStaticMarkup(
    <ObszarRoboczy
      czasAktualnyMs={0}
      formatujCzasPodgladu={formatujCzasTestowy}
      naZmianeCzasuOdtwarzania={vi.fn()}
      {...wlasciwosci}
    />
  );
}

describe("ObszarRoboczy", () => {
  it("formatuje czas podgladu", () => {
    expect(
      utworzTekstCzasuPodgladu(3250, 9334, formatujCzasTestowy)
    ).toBe("00:00:03.250 / 00:00:09.334");
  });

  it("pokazuje pusty stan przy braku filmu", () => {
    const widok = wyrenderujObszarRoboczy();

    expect(widok).toContain("Zaimportuj film, aby rozpocząć.");
    expect(widok).toContain("Import znajdziesz w lewym panelu.");
  });

  it("pokazuje bezpieczny stan, gdy brakuje objectUrl", () => {
    const widok = wyrenderujObszarRoboczy({
      plikWideo
    });

    expect(widok).toContain("Podgląd wideo nie jest jeszcze gotowy.");
    expect(widok).toContain("lekcja.mp4");
  });

  it("pokazuje film z gotowym objectUrl", () => {
    const widok = wyrenderujObszarRoboczy({
      plikWideo,
      podgladWideo: {
        idMedium: "medium-1",
        objectUrl: "blob:http://localhost/medium-1",
        statusMiniatury: "gotowe"
      },
      czasAktualnyMs: 3250
    });

    expect(widok).toContain("lekcja.mp4");
    expect(widok).toContain("blob:http://localhost/medium-1");
    expect(widok).toContain("00:00:03.250 / 00:00:09.334");
    expect(widok).toContain("Rozdzielczość");
    expect(widok).toContain("1920 x 1080");
  });
});
