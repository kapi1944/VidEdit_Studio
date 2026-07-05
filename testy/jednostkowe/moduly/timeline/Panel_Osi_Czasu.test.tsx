import { act, createRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { KlipTimeline } from "../../../../src/domena/timeline/typyTimeline";
import { DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE } from "../../../../src/domena/timeline/typyTimeline";
import { Panel_Osi_Czasu } from "../../../../src/moduly/timeline/komponenty/Panel_Osi_Czasu";

let korzen: Root | undefined;
let kontener: HTMLDivElement | undefined;

function formatujCzasTestowy(czasMs: number) {
  return `${czasMs} ms`;
}

function utworzWymiaryTimeline(szerokosc: number): DOMRect {
  return {
    bottom: 20,
    height: 20,
    left: 0,
    right: szerokosc,
    top: 0,
    width: szerokosc,
    x: 0,
    y: 0,
    toJSON: () => ({})
  };
}

const klipTimeline: KlipTimeline = {
  id: "klip-1",
  idPlikuMediow: "medium-1",
  rodzaj: "wideo",
  czasStartuMs: 0,
  czasTrwaniaMs: 10_000,
  sciezka: "wideo-1",
  nazwa: "Intro timeline"
};

function wyrenderujPanelOsiCzasu(
  naZmianeCzasuTimeline: (czasMs: number) => void,
  nadpisaneWlasciwosci: Partial<Parameters<typeof Panel_Osi_Czasu>[0]> = {}
) {
  kontener = document.createElement("div");
  document.body.appendChild(kontener);
  korzen = createRoot(kontener);

  act(() => {
    korzen?.render(
      <Panel_Osi_Czasu
        nazwaProjektu="Test"
        klipyTimeline={[klipTimeline]}
        czasTrwaniaMs={10_000}
        czasAktualnyMs={0}
        segmentyCiszy={[]}
        uchwytWideoRef={createRef<HTMLVideoElement>()}
        formatujCzasTimeline={formatujCzasTestowy}
        naZmianeCzasuTimeline={naZmianeCzasuTimeline}
        naZmianePrzeciaganiaGlowicy={vi.fn()}
        naWybranoSegmentCiszy={vi.fn()}
        {...nadpisaneWlasciwosci}
      />
    );
  });

  const obszarTimeline = kontener.querySelector<HTMLDivElement>(
    ".panel-osi-czasu__obszar"
  );

  if (!obszarTimeline) {
    throw new Error("Brak obszaru timeline w tescie.");
  }

  vi.spyOn(obszarTimeline, "getBoundingClientRect").mockReturnValue(
    utworzWymiaryTimeline(500)
  );

  return obszarTimeline;
}

function PanelOsiCzasuZeStanemSiatki() {
  const [ustawieniaSiatki, ustawUstawieniaSiatki] = useState(
    DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE
  );

  return (
    <Panel_Osi_Czasu
      nazwaProjektu="Test"
      klipyTimeline={[klipTimeline]}
      czasTrwaniaMs={10_000}
      czasAktualnyMs={0}
      segmentyCiszy={[]}
      uchwytWideoRef={createRef<HTMLVideoElement>()}
      formatujCzasTimeline={formatujCzasTestowy}
      ustawieniaSiatkiTimeline={ustawieniaSiatki}
      naZmianeCzasuTimeline={vi.fn()}
      naZmianeUstawienSiatkiTimeline={ustawUstawieniaSiatki}
      naZmianePrzeciaganiaGlowicy={vi.fn()}
      naWybranoSegmentCiszy={vi.fn()}
    />
  );
}

function wyrenderujPanelOsiCzasuZeStanemSiatki() {
  kontener = document.createElement("div");
  document.body.appendChild(kontener);
  korzen = createRoot(kontener);

  act(() => {
    korzen?.render(<PanelOsiCzasuZeStanemSiatki />);
  });
}

afterEach(() => {
  act(() => {
    korzen?.unmount();
  });

  kontener?.remove();
  korzen = undefined;
  kontener = undefined;
  vi.restoreAllMocks();
});

describe("Panel_Osi_Czasu", () => {
  it("nie pokazuje falszywego klipu wideo przy technicznej dlugosci bez klipow timeline", () => {
    wyrenderujPanelOsiCzasu(vi.fn(), {
      klipyTimeline: [],
      czasTrwaniaMs: 30_000
    });

    expect(kontener?.textContent).not.toContain("Klip wideo");
    expect(kontener?.textContent).toContain("Brak klipow na osi czasu.");
    expect(kontener?.textContent).toContain("Dlugosc: brak klipow");
  });

  it("pokazuje klip z timeline", () => {
    wyrenderujPanelOsiCzasu(vi.fn());

    expect(kontener?.textContent).toContain("Intro timeline");
    expect(kontener?.textContent).toContain("10000 ms");
  });

  it("renderuje wszystkie tryby siatki timeline", () => {
    wyrenderujPanelOsiCzasu(vi.fn());

    const opcjeSiatki = Array.from(
      kontener?.querySelectorAll<HTMLOptionElement>(
        ".panel-osi-czasu__siatka option"
      ) ?? []
    ).map((opcjaSiatki) => opcjaSiatki.textContent);

    expect(opcjeSiatki).toEqual([
      "Bez dociagania",
      "1 s",
      "0,5 s",
      "0,1 s",
      "1 klatka",
      "5 klatek",
      "10 klatek"
    ]);
  });

  it("aktualizuje opis po zmianie trybu siatki", () => {
    wyrenderujPanelOsiCzasuZeStanemSiatki();

    const wyborSiatki = kontener?.querySelector<HTMLSelectElement>(
      ".panel-osi-czasu__siatka select"
    );

    if (!wyborSiatki) {
      throw new Error("Brak selektora siatki timeline.");
    }

    act(() => {
      wyborSiatki.value = "polSekundy";
      wyborSiatki.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(kontener?.textContent).toContain("Siatka: 0,5 s");
  });

  it("ustawia czas po kliknieciu w timeline", () => {
    const obsluzZmianeCzasuTimeline = vi.fn();
    const obszarTimeline = wyrenderujPanelOsiCzasu(
      obsluzZmianeCzasuTimeline
    );

    act(() => {
      obszarTimeline.dispatchEvent(
        new MouseEvent("mousedown", {
          bubbles: true,
          button: 0,
          clientX: 250
        })
      );
    });

    expect(obsluzZmianeCzasuTimeline).toHaveBeenCalledWith(5_000);
  });

  it("ogranicza przeciaganie glowicy do czasu trwania filmu", () => {
    const obsluzZmianeCzasuTimeline = vi.fn();
    const obszarTimeline = wyrenderujPanelOsiCzasu(
      obsluzZmianeCzasuTimeline
    );
    const znacznikCzasu =
      obszarTimeline.querySelector<HTMLButtonElement>(".znacznik-czasu");

    if (!znacznikCzasu) {
      throw new Error("Brak znacznika czasu w tescie.");
    }

    act(() => {
      znacznikCzasu.dispatchEvent(
        new MouseEvent("mousedown", {
          bubbles: true,
          button: 0,
          clientX: 0
        })
      );
    });

    act(() => {
      document.dispatchEvent(
        new MouseEvent("mousemove", {
          bubbles: true,
          clientX: 600
        })
      );
      document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    });

    expect(obsluzZmianeCzasuTimeline).toHaveBeenLastCalledWith(10_000);
  });
});
