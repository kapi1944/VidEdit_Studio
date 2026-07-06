import { act, createRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { KlipTimeline } from "../../../../src/domena/timeline/typyTimeline";
import {
  DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE,
  pobierzKrokEdycjiTimeline,
  przetnijKlipTimeline,
  przesunKlipTimeline,
  skrocKoniecKlipuTimeline,
  USTAWIENIA_DOCIAGANIA_TIMELINE_MVP
} from "../../../../src/domena/timeline/typyTimeline";
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

function PanelOsiCzasuZCieciem() {
  const [klipyTimeline, ustawKlipyTimeline] = useState([klipTimeline]);
  const [idZaznaczonegoKlipu, ustawIdZaznaczonegoKlipu] = useState<string>();
  const ustawieniaSiatki = USTAWIENIA_DOCIAGANIA_TIMELINE_MVP[1];

  function obsluzCiecie() {
    if (!idZaznaczonegoKlipu) {
      return;
    }

    const wynikCiecia = przetnijKlipTimeline(
      klipyTimeline,
      idZaznaczonegoKlipu,
      4.4,
      ustawieniaSiatki
    );

    if (wynikCiecia.czySukces) {
      ustawKlipyTimeline(wynikCiecia.dane);
      ustawIdZaznaczonegoKlipu(undefined);
    }
  }

  return (
    <Panel_Osi_Czasu
      nazwaProjektu="Test"
      klipyTimeline={klipyTimeline}
      czasTrwaniaMs={10_000}
      czasAktualnyMs={4400}
      segmentyCiszy={[]}
      idZaznaczonegoKlipuTimeline={idZaznaczonegoKlipu}
      uchwytWideoRef={createRef<HTMLVideoElement>()}
      formatujCzasTimeline={formatujCzasTestowy}
      ustawieniaSiatkiTimeline={ustawieniaSiatki}
      naZmianeCzasuTimeline={vi.fn()}
      naZaznaczKlipTimeline={ustawIdZaznaczonegoKlipu}
      naPrzetnijZaznaczonyKlip={obsluzCiecie}
      naZmianePrzeciaganiaGlowicy={vi.fn()}
      naWybranoSegmentCiszy={vi.fn()}
    />
  );
}

function wyrenderujPanelOsiCzasuZCieciem() {
  kontener = document.createElement("div");
  document.body.appendChild(kontener);
  korzen = createRoot(kontener);

  act(() => {
    korzen?.render(<PanelOsiCzasuZCieciem />);
  });
}

function PanelOsiCzasuZEdycja() {
  const [klipyTimeline, ustawKlipyTimeline] = useState([klipTimeline]);
  const [idZaznaczonegoKlipu, ustawIdZaznaczonegoKlipu] = useState<string>();
  const ustawieniaSiatki = DOMYSLNE_USTAWIENIA_DOCIAGANIA_TIMELINE;
  const krokEdycji = pobierzKrokEdycjiTimeline(ustawieniaSiatki);

  function zastosujWynikEdycji(wynik: ReturnType<typeof przesunKlipTimeline>) {
    if (wynik.czySukces) {
      ustawKlipyTimeline(wynik.dane);
    }
  }

  function obsluzPrzesuniecieWPrawo() {
    const klip = klipyTimeline.find(
      (klipTimelineDoEdycji) => klipTimelineDoEdycji.id === idZaznaczonegoKlipu
    );

    if (!klip || !idZaznaczonegoKlipu) {
      return;
    }

    zastosujWynikEdycji(
      przesunKlipTimeline(
        klipyTimeline,
        idZaznaczonegoKlipu,
        klip.czasStartuMs / 1000 + krokEdycji,
        ustawieniaSiatki
      )
    );
  }

  function obsluzSkrocenieKonca() {
    const klip = klipyTimeline.find(
      (klipTimelineDoEdycji) => klipTimelineDoEdycji.id === idZaznaczonegoKlipu
    );

    if (!klip || !idZaznaczonegoKlipu) {
      return;
    }

    zastosujWynikEdycji(
      skrocKoniecKlipuTimeline(
        klipyTimeline,
        idZaznaczonegoKlipu,
        (klip.czasStartuMs + klip.czasTrwaniaMs) / 1000 - krokEdycji,
        ustawieniaSiatki
      )
    );
  }

  return (
    <Panel_Osi_Czasu
      nazwaProjektu="Test"
      klipyTimeline={klipyTimeline}
      czasTrwaniaMs={12_000}
      czasAktualnyMs={0}
      segmentyCiszy={[]}
      idZaznaczonegoKlipuTimeline={idZaznaczonegoKlipu}
      uchwytWideoRef={createRef<HTMLVideoElement>()}
      formatujCzasTimeline={formatujCzasTestowy}
      ustawieniaSiatkiTimeline={ustawieniaSiatki}
      naZmianeCzasuTimeline={vi.fn()}
      naZaznaczKlipTimeline={ustawIdZaznaczonegoKlipu}
      naPrzesunZaznaczonyKlipWPrawo={obsluzPrzesuniecieWPrawo}
      naSkrocKoniecZaznaczonegoKlipu={obsluzSkrocenieKonca}
      naZmianePrzeciaganiaGlowicy={vi.fn()}
      naWybranoSegmentCiszy={vi.fn()}
    />
  );
}

function wyrenderujPanelOsiCzasuZEdycja() {
  kontener = document.createElement("div");
  document.body.appendChild(kontener);
  korzen = createRoot(kontener);

  act(() => {
    korzen?.render(<PanelOsiCzasuZEdycja />);
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



  it("renderuje etykiety sciezek w gutterze poza siatka", () => {
    wyrenderujPanelOsiCzasu(vi.fn());

    const gutter = kontener?.querySelector(".panel-osi-czasu__gutter-sciezek");
    const siatka = kontener?.querySelector(".panel-osi-czasu__obszar");

    expect(gutter?.textContent).toContain("Wideo 1");
    expect(gutter?.textContent).toContain("Obrazy");
    expect(gutter?.textContent).toContain("Audio 1");
    expect(siatka?.querySelector(".panel-osi-czasu__etykieta-sciezki")).toBeNull();
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

  it("blokuje ciecie bez zaznaczonego klipu", () => {
    wyrenderujPanelOsiCzasu(vi.fn());

    const przyciskCiecia = Array.from(
      kontener?.querySelectorAll<HTMLButtonElement>("button") ?? []
    ).find((przycisk) => przycisk.textContent === "Przetnij w playheadzie");

    expect(przyciskCiecia?.disabled).toBe(true);
  });

  it("blokuje edycje bez zaznaczonego klipu", () => {
    wyrenderujPanelOsiCzasuZEdycja();
    const przyciskPrzesuniecia = Array.from(
      kontener?.querySelectorAll<HTMLButtonElement>("button") ?? []
    ).find((przycisk) => przycisk.textContent === "Przesun w prawo");

    expect(przyciskPrzesuniecia?.disabled).toBe(true);
  });

  it("zaznaczenie klipu pokazuje podstawowe akcje edycji", () => {
    wyrenderujPanelOsiCzasuZEdycja();
    const pasekKlipu =
      kontener?.querySelector<HTMLButtonElement>(".pasek-klipu");

    if (!pasekKlipu) {
      throw new Error("Brak paska klipu w tescie.");
    }

    act(() => {
      pasekKlipu.click();
    });

    expect(kontener?.textContent).toContain("Przesun w lewo");
    expect(kontener?.textContent).toContain("Przesun w prawo");
    expect(kontener?.textContent).toContain("Skroc poczatek");
    expect(kontener?.textContent).toContain("Skroc koniec");
  });

  it("przesuniecie w prawo aktualizuje pozycje klipu", () => {
    wyrenderujPanelOsiCzasuZEdycja();
    const pasekKlipu =
      kontener?.querySelector<HTMLButtonElement>(".pasek-klipu");
    const przyciskPrzesuniecia = Array.from(
      kontener?.querySelectorAll<HTMLButtonElement>("button") ?? []
    ).find((przycisk) => przycisk.textContent === "Przesun w prawo");

    if (!pasekKlipu || !przyciskPrzesuniecia) {
      throw new Error("Brak elementow edycji klipu w tescie.");
    }

    act(() => {
      pasekKlipu.click();
    });
    act(() => {
      przyciskPrzesuniecia.click();
    });

    expect(pasekKlipu.style.left).toBe("4.166666666666666%");
  });

  it("skrocenie konca aktualizuje dlugosc klipu", () => {
    wyrenderujPanelOsiCzasuZEdycja();
    const pasekKlipu =
      kontener?.querySelector<HTMLButtonElement>(".pasek-klipu");
    const przyciskSkrocenia = Array.from(
      kontener?.querySelectorAll<HTMLButtonElement>("button") ?? []
    ).find((przycisk) => przycisk.textContent === "Skroc koniec");

    if (!pasekKlipu || !przyciskSkrocenia) {
      throw new Error("Brak elementow skrocenia klipu w tescie.");
    }

    act(() => {
      pasekKlipu.click();
    });
    act(() => {
      przyciskSkrocenia.click();
    });

    expect(kontener?.textContent).toContain("9500 ms");
  });

  it("pozwala zaznaczyc klip i uruchomic ciecie", () => {
    wyrenderujPanelOsiCzasuZCieciem();
    const pasekKlipu =
      kontener?.querySelector<HTMLButtonElement>(".pasek-klipu");
    const przyciskCiecia = Array.from(
      kontener?.querySelectorAll<HTMLButtonElement>("button") ?? []
    ).find((przycisk) => przycisk.textContent === "Przetnij w playheadzie");

    if (!pasekKlipu || !przyciskCiecia) {
      throw new Error("Brak elementow ciecia klipu w tescie.");
    }

    act(() => {
      pasekKlipu.click();
    });

    expect(kontener?.textContent).toContain("Zaznaczony klip: Intro timeline");
    expect(przyciskCiecia.disabled).toBe(false);

    act(() => {
      przyciskCiecia.click();
    });

    expect(kontener?.querySelectorAll(".pasek-klipu")).toHaveLength(2);
  });

  it("aktywny snap wplywa na czas ciecia", () => {
    wyrenderujPanelOsiCzasuZCieciem();
    const pasekKlipu =
      kontener?.querySelector<HTMLButtonElement>(".pasek-klipu");
    const przyciskCiecia = Array.from(
      kontener?.querySelectorAll<HTMLButtonElement>("button") ?? []
    ).find((przycisk) => przycisk.textContent === "Przetnij w playheadzie");

    if (!pasekKlipu || !przyciskCiecia) {
      throw new Error("Brak elementow ciecia klipu w tescie.");
    }

    act(() => {
      pasekKlipu.click();
    });

    act(() => {
      przyciskCiecia.click();
    });

    expect(kontener?.textContent).toContain("4000 ms");
    expect(kontener?.textContent).toContain("6000 ms");
  });

  it("ustawia czas po kliknieciu w pasek markerow", () => {
    const obsluzZmianeCzasuTimeline = vi.fn();
    const obszarTimeline = wyrenderujPanelOsiCzasu(
      obsluzZmianeCzasuTimeline
    );
    const pasekMarkerow = obszarTimeline.querySelector<HTMLDivElement>(
      ".panel-osi-czasu__pasek-markerow"
    );

    if (!pasekMarkerow) {
      throw new Error("Brak paska markerow w tescie.");
    }

    act(() => {
      pasekMarkerow.dispatchEvent(
        new MouseEvent("mousedown", {
          bubbles: true,
          button: 0,
          clientX: 250
        })
      );
    });

    expect(obsluzZmianeCzasuTimeline).toHaveBeenCalledWith(5_000);
  });

  it("klikniecie klipu nie przesuwa playheada", () => {
    const obsluzZmianeCzasuTimeline = vi.fn();
    const obszarTimeline = wyrenderujPanelOsiCzasu(
      obsluzZmianeCzasuTimeline,
      {
        naZaznaczKlipTimeline: vi.fn()
      }
    );
    const pasekKlipu =
      obszarTimeline.querySelector<HTMLButtonElement>(".pasek-klipu");

    if (!pasekKlipu) {
      throw new Error("Brak paska klipu w tescie.");
    }

    act(() => {
      pasekKlipu.dispatchEvent(
        new MouseEvent("mousedown", {
          bubbles: true,
          button: 0,
          clientX: 250
        })
      );
      pasekKlipu.click();
    });

    expect(obsluzZmianeCzasuTimeline).not.toHaveBeenCalled();
  });

  it("usuwa marker po dwukliku", () => {
    const obsluzUsuniecieMarkera = vi.fn();
    const obszarTimeline = wyrenderujPanelOsiCzasu(vi.fn(), {
      markeryTimeline: [{ id: "marker-1000", czasMs: 1000 }],
      naUsunMarkerTimeline: obsluzUsuniecieMarkera
    });
    const markerTimeline =
      obszarTimeline.querySelector<HTMLButtonElement>(".marker-timeline");

    if (!markerTimeline) {
      throw new Error("Brak markera timeline w tescie.");
    }

    act(() => {
      markerTimeline.dispatchEvent(
        new MouseEvent("dblclick", {
          bubbles: true,
          button: 0
        })
      );
    });

    expect(obsluzUsuniecieMarkera).toHaveBeenCalledWith("marker-1000");
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
