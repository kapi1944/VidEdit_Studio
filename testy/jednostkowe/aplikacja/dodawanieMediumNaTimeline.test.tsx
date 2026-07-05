import { act, createRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { utworzPustyProjekt } from "../../../src/domena/projekt/fabrykaProjektu";
import { dodajMediumNaTimeline } from "../../../src/domena/projekt/operacjeProjektu";
import type { ProjektMontazu } from "../../../src/domena/projekt/typyProjektu";
import type { PlikMediow } from "../../../src/domena/media/typyMediow";
import { obliczDlugoscTimelineZKlipow } from "../../../src/domena/timeline/typyTimeline";
import { Lista_Mediow } from "../../../src/moduly/media/komponenty/Lista_Mediow";
import { Panel_Osi_Czasu } from "../../../src/moduly/timeline/komponenty/Panel_Osi_Czasu";

let korzen: Root | undefined;
let kontener: HTMLDivElement | undefined;

const pierwszeMedium: PlikMediow = {
  id: "medium-1",
  nazwaPliku: "pierwsze.mp4",
  sciezkaPliku: "",
  rozszerzenie: ".mp4",
  typMime: "video/mp4",
  rozmiarBajtow: 1024,
  statusImportu: "zaimportowany",
  typ: "wideo",
  metadane: {
    czasTrwaniaMs: 8000,
    czyMetadanePelne: true
  }
};

const drugieMedium: PlikMediow = {
  id: "medium-2",
  nazwaPliku: "drugie.mp4",
  sciezkaPliku: "",
  rozszerzenie: ".mp4",
  typMime: "video/mp4",
  rozmiarBajtow: 2048,
  statusImportu: "zaimportowany",
  typ: "wideo",
  metadane: {
    czasTrwaniaMs: 4000,
    czyMetadanePelne: true
  }
};

function formatujCzasTestowy(czasMs: number) {
  return `${czasMs} ms`;
}

function utworzProjektTestowy(media: PlikMediow[]): ProjektMontazu {
  return {
    ...utworzPustyProjekt("Projekt testowy"),
    media
  };
}

function SrodowiskoDodawaniaMediumNaTimeline({
  media
}: {
  media: PlikMediow[];
}) {
  const [projekt, ustawProjekt] = useState(() => utworzProjektTestowy(media));
  const klipyTimeline = projekt.timeline.klipy;
  const czasTrwaniaTimelineMs = Math.max(
    10_000,
    obliczDlugoscTimelineZKlipow(klipyTimeline)
  );

  function obsluzDodanieNaTimeline(idMedium: string) {
    const wynikDodania = dodajMediumNaTimeline(projekt, idMedium);

    if (wynikDodania.czySukces) {
      ustawProjekt(wynikDodania.dane);
    }
  }

  return (
    <>
      <Lista_Mediow
        media={projekt.media}
        podgladyMediow={{}}
        naDodajNaTimeline={obsluzDodanieNaTimeline}
      />
      <Panel_Osi_Czasu
        nazwaProjektu={projekt.nazwa}
        klipyTimeline={klipyTimeline}
        czasTrwaniaMs={czasTrwaniaTimelineMs}
        czasAktualnyMs={0}
        segmentyCiszy={[]}
        uchwytWideoRef={createRef<HTMLVideoElement>()}
        formatujCzasTimeline={formatujCzasTestowy}
        naZmianeCzasuTimeline={vi.fn()}
        naZmianePrzeciaganiaGlowicy={vi.fn()}
        naWybranoSegmentCiszy={vi.fn()}
      />
    </>
  );
}

function wyrenderujSrodowisko(media: PlikMediow[]) {
  kontener = document.createElement("div");
  document.body.appendChild(kontener);
  korzen = createRoot(kontener);

  act(() => {
    korzen?.render(<SrodowiskoDodawaniaMediumNaTimeline media={media} />);
  });
}

function pobierzTekstTimeline() {
  return (
    kontener?.querySelector(".panel-osi-czasu")?.textContent ?? ""
  );
}

afterEach(() => {
  act(() => {
    korzen?.unmount();
  });

  kontener?.remove();
  korzen = undefined;
  kontener = undefined;
});

describe("dodawanie medium na timeline w UI", () => {
  it("import medium bez klikniecia nie tworzy klipu", () => {
    wyrenderujSrodowisko([pierwszeMedium]);

    expect(pobierzTekstTimeline()).toContain("Brak klipow na osi czasu.");
    expect(kontener?.querySelector(".pasek-klipu")).toBeNull();
  });

  it("przycisk Dodaj na os czasu tworzy klip", () => {
    wyrenderujSrodowisko([pierwszeMedium]);
    const przycisk = kontener?.querySelector<HTMLButtonElement>("button");

    if (!przycisk) {
      throw new Error("Brak przycisku dodania medium na timeline.");
    }

    act(() => {
      przycisk.click();
    });

    expect(pobierzTekstTimeline()).toContain("pierwsze.mp4");
    expect(kontener?.querySelector(".pasek-klipu")).not.toBeNull();
  });

  it("timeline pokazuje klipy, a nie pierwszy plik z biblioteki", () => {
    wyrenderujSrodowisko([pierwszeMedium, drugieMedium]);
    const przyciski = kontener?.querySelectorAll<HTMLButtonElement>("button");
    const przyciskDrugiegoMedium = przyciski?.[1];

    if (!przyciskDrugiegoMedium) {
      throw new Error("Brak przycisku drugiego medium.");
    }

    act(() => {
      przyciskDrugiegoMedium.click();
    });

    expect(pobierzTekstTimeline()).toContain("drugie.mp4");
    expect(pobierzTekstTimeline()).not.toContain("pierwsze.mp4");
  });
});
