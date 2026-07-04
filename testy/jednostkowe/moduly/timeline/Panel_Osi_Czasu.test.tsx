import { act, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

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

function wyrenderujPanelOsiCzasu(
  naZmianeCzasuTimeline: (czasMs: number) => void
) {
  kontener = document.createElement("div");
  document.body.appendChild(kontener);
  korzen = createRoot(kontener);

  act(() => {
    korzen?.render(
      <Panel_Osi_Czasu
        nazwaProjektu="Test"
        czasTrwaniaMs={10_000}
        czasAktualnyMs={0}
        segmentyCiszy={[]}
        uchwytWideoRef={createRef<HTMLVideoElement>()}
        formatujCzasTimeline={formatujCzasTestowy}
        naZmianeCzasuTimeline={naZmianeCzasuTimeline}
        naZmianePrzeciaganiaGlowicy={vi.fn()}
        naWybranoSegmentCiszy={vi.fn()}
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
