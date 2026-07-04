import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ObszarRoboczy } from "../../../src/aplikacja/komponenty/AplikacjaVidEdit";
import {
  obliczCzasPodgladuKlipu,
  pobierzPodgladDlaMedium,
  znajdzAktywnyKlipTimeline,
  znajdzMediumDlaKlipu
} from "../../../src/aplikacja/komponenty/pomocnicyObszaruRoboczego";
import { utworzTekstCzasuPodgladu } from "../../../src/aplikacja/komponenty/PodgladWideo";
import { formatujCzas } from "../../../src/domena/czas/formatowanieCzasu";
import type { PlikMediow } from "../../../src/domena/media/typyMediow";
import type { KlipTimeline } from "../../../src/domena/timeline/typyTimeline";
import type { PodgladyMediow } from "../../../src/moduly/media/typyPodgladuMediow";

const plikWideo: PlikMediow = {
  id: "medium-wideo-1",
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

const plikGrafiki: PlikMediow = {
  id: "medium-grafika-1",
  nazwaPliku: "plansza.png",
  sciezkaPliku: "",
  rozszerzenie: ".png",
  typMime: "image/png",
  rozmiarBajtow: 512,
  statusImportu: "zaimportowany",
  typ: "grafika"
};

const klipWideo: KlipTimeline = {
  id: "klip-wideo-1",
  idPlikuMediow: plikWideo.id,
  rodzaj: "wideo",
  czasStartuMs: 1000,
  czasTrwaniaMs: 6000,
  zrodloStartMs: 2000,
  zrodloKoniecMs: 8000,
  sciezka: "wideo-1",
  nazwa: "Intro kursu"
};

const klipGrafiki: KlipTimeline = {
  id: "klip-grafika-1",
  idPlikuMediow: plikGrafiki.id,
  rodzaj: "grafika",
  czasStartuMs: 0,
  czasTrwaniaMs: 3000,
  sciezka: "wideo-1",
  nazwa: "Plansza tytulowa"
};

function formatujCzasTestowy(czasMs: number) {
  return formatujCzas(czasMs, "czas");
}

function wyrenderujObszarRoboczy(
  wlasciwosci: Partial<Parameters<typeof ObszarRoboczy>[0]> = {}
) {
  return renderToStaticMarkup(
    <ObszarRoboczy
      media={[]}
      klipyTimeline={[]}
      podgladyMediow={{}}
      czasAktualnyMs={0}
      uchwytWideoRef={createRef<HTMLVideoElement>()}
      czyPrzeciaganieGlowicy={false}
      formatujCzasPodgladu={formatujCzasTestowy}
      naZmianeCzasuOdtwarzania={vi.fn()}
      {...wlasciwosci}
    />
  );
}

describe("ObszarRoboczy", () => {
  it("formatuje czas podgladu", () => {
    expect(utworzTekstCzasuPodgladu(3250, 9334, formatujCzasTestowy)).toBe(
      "00:00:03.250 / 00:00:09.334"
    );
  });

  it("pokazuje pusty stan przy braku mediow", () => {
    const widok = wyrenderujObszarRoboczy();

    expect(widok).toContain("Zaimportuj media, aby rozpocząć montaż.");
    expect(widok).toContain(
      "Możesz dodać kilka plików wideo lub grafik, a potem ułożyć je na osi czasu."
    );
  });

  it("pokazuje stan mediow bez klipow timeline", () => {
    const widok = wyrenderujObszarRoboczy({
      media: [plikWideo]
    });

    expect(widok).toContain("Dodaj media na oś czasu.");
    expect(widok).toContain(
      "Wybierz plik z panelu mediów i dodaj go jako klip na timeline."
    );
    expect(widok).toContain(
      "Dodawanie na timeline zostanie podłączone w następnym etapie."
    );
  });

  it("pokazuje aktywny klip wideo z gotowym objectUrl", () => {
    const widok = wyrenderujObszarRoboczy({
      media: [plikWideo],
      klipyTimeline: [klipWideo],
      podgladyMediow: {
        [plikWideo.id]: {
          idMedium: plikWideo.id,
          objectUrl: "blob:http://localhost/medium-wideo-1",
          statusMiniatury: "gotowe"
        }
      },
      czasAktualnyMs: 3250
    });

    expect(widok).toContain("Podgląd aktywnego klipu");
    expect(widok).toContain("Intro kursu");
    expect(widok).toContain("Zrodlo: lekcja.mp4");
    expect(widok).toContain("blob:http://localhost/medium-wideo-1");
    expect(widok).toContain("00:00:04.250 / 00:00:06.000");
    expect(widok).toContain("1920 x 1080");
  });

  it("pokazuje aktywny klip grafiki z podgladem obrazu", () => {
    const widok = wyrenderujObszarRoboczy({
      media: [plikGrafiki],
      klipyTimeline: [klipGrafiki],
      podgladyMediow: {
        [plikGrafiki.id]: {
          idMedium: plikGrafiki.id,
          objectUrl: "blob:http://localhost/grafika-1"
        }
      }
    });

    expect(widok).toContain("Grafika na timeline");
    expect(widok).toContain("Plansza tytulowa");
    expect(widok).toContain("Zrodlo: plansza.png");
    expect(widok).toContain("Czas trwania klipu: 00:00:03.000");
    expect(widok).toContain("blob:http://localhost/grafika-1");
  });

  it("pokazuje bezpieczny placeholder dla klipu bez objectUrl", () => {
    const widok = wyrenderujObszarRoboczy({
      media: [plikWideo],
      klipyTimeline: [klipWideo],
      podgladyMediow: {},
      czasAktualnyMs: 1000
    });

    expect(widok).toContain("Podgląd aktywnego klipu nie jest jeszcze gotowy.");
    expect(widok).toContain("Intro kursu");
    expect(widok).toContain("Źródło: lekcja.mp4");
  });
});

describe("pomocnicy obszaru roboczego", () => {
  it("wybiera aktywny klip, medium i podglad", () => {
    const podgladyMediow: PodgladyMediow = {
      [plikWideo.id]: {
        idMedium: plikWideo.id,
        objectUrl: "blob:http://localhost/medium-wideo-1"
      }
    };
    const aktywnyKlip = znajdzAktywnyKlipTimeline([klipWideo], 1500);
    const medium = znajdzMediumDlaKlipu([plikWideo], aktywnyKlip);

    expect(aktywnyKlip).toBe(klipWideo);
    expect(medium).toBe(plikWideo);
    expect(pobierzPodgladDlaMedium(podgladyMediow, medium)).toEqual(
      podgladyMediow[plikWideo.id]
    );
    expect(obliczCzasPodgladuKlipu(klipWideo, 3250)).toBe(4250);
  });

  it("pobiera podglad medium aktywnego klipu po id", () => {
    const podgladyMediow: PodgladyMediow = {
      [plikWideo.id]: {
        idMedium: plikWideo.id,
        objectUrl: "blob:http://localhost/medium-wideo-1"
      },
      [plikGrafiki.id]: {
        idMedium: plikGrafiki.id,
        objectUrl: "blob:http://localhost/grafika-1"
      }
    };
    const aktywnyKlip = znajdzAktywnyKlipTimeline(
      [klipWideo, klipGrafiki],
      500
    );
    const medium = znajdzMediumDlaKlipu([plikWideo, plikGrafiki], aktywnyKlip);

    expect(aktywnyKlip).toBe(klipGrafiki);
    expect(medium).toBe(plikGrafiki);
    expect(pobierzPodgladDlaMedium(podgladyMediow, medium)).toEqual(
      podgladyMediow[plikGrafiki.id]
    );
  });

  it("zwraca bezpieczny brak podgladu dla medium bez wpisu", () => {
    const aktywnyKlip = znajdzAktywnyKlipTimeline([klipWideo], 1500);
    const medium = znajdzMediumDlaKlipu([plikWideo], aktywnyKlip);

    expect(pobierzPodgladDlaMedium({}, medium)).toBeUndefined();
    expect(pobierzPodgladDlaMedium({}, undefined)).toBeUndefined();
  });
});
