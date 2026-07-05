import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  MetadaneWideo,
  PlikMediow
} from "../../../src/domena/media/typyMediow";
import type { PropozycjaCiecia } from "../../../src/domena/timeline/typyTimeline";
import { utworzPustyProjekt } from "../../../src/domena/projekt/fabrykaProjektu";
import {
  dodajMediumNaTimeline,
  dodajMediumDoProjektu,
  zaktualizujMetadaneMediumWProjekcie,
  zaktualizujPropozycjeCiecWProjekcie
} from "../../../src/domena/projekt/operacjeProjektu";

function utworzPlikMediow(nadpisaneDane: Partial<PlikMediow> = {}): PlikMediow {
  return {
    id: "media-1",
    nazwaPliku: "nagranie.mp4",
    sciezkaPliku: "nagranie.mp4",
    rozszerzenie: ".mp4",
    typMime: "video/mp4",
    rozmiarBajtow: 2048,
    statusImportu: "zaimportowany",
    typ: "wideo",
    ...nadpisaneDane
  };
}

function pobierzProjektZWynikuDodania(
  wynik: ReturnType<typeof dodajMediumNaTimeline>
) {
  if (!wynik.czySukces) {
    throw new Error("Oczekiwano poprawnego dodania medium na timeline.");
  }

  return wynik.dane;
}

function utworzMetadaneWideo(
  nadpisaneDane: Partial<MetadaneWideo> = {}
): MetadaneWideo {
  return {
    czasTrwaniaMs: 125000,
    szerokoscPx: 1920,
    wysokoscPx: 1080,
    czyMetadanePelne: false,
    ...nadpisaneDane
  };
}

function utworzPropozycjeCiecia(
  nadpisaneDane: Partial<PropozycjaCiecia> = {}
): PropozycjaCiecia {
  return {
    id: "propozycja-ciecia-cisza-1",
    idSegmentuCiszy: "cisza-1",
    czasPoczatkuMs: 1000,
    czasKoncaMs: 2500,
    status: "oczekuje",
    powod: "cisza",
    utworzonoAutomatycznie: true,
    ...nadpisaneDane
  };
}

describe("operacje projektu", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("dodaje pierwsze medium do pustego projektu", () => {
    const projekt = utworzPustyProjekt("Projekt testowy");
    const plikMediow = utworzPlikMediow();

    const projektPoDodaniu = dodajMediumDoProjektu(projekt, plikMediow);

    expect(projektPoDodaniu.media).toEqual([plikMediow]);
  });

  it("dodaje kolejne medium bez usuwania poprzedniego wideo", () => {
    const istniejacyPlik = utworzPlikMediow({ id: "media-1" });
    const drugiPlik = utworzPlikMediow({
      id: "media-2",
      nazwaPliku: "drugie.mp4",
      sciezkaPliku: "drugie.mp4"
    });
    const projekt = {
      ...utworzPustyProjekt("Projekt testowy"),
      media: [istniejacyPlik]
    };

    const projektPoDodaniu = dodajMediumDoProjektu(projekt, drugiPlik);

    expect(projektPoDodaniu.media).toEqual([istniejacyPlik, drugiPlik]);
  });

  it("aktualizuje date modyfikacji projektu", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-04T10:00:00.000Z"));
    const projekt = utworzPustyProjekt("Projekt testowy");

    vi.setSystemTime(new Date("2026-07-04T11:00:00.000Z"));
    const projektPoDodaniu = dodajMediumDoProjektu(projekt, utworzPlikMediow());

    expect(projektPoDodaniu.dataModyfikacjiIso).toBe(
      "2026-07-04T11:00:00.000Z"
    );
  });

  it("nie mutuje starego obiektu projektu", () => {
    const projekt = utworzPustyProjekt("Projekt testowy");

    const projektPoDodaniu = dodajMediumDoProjektu(projekt, utworzPlikMediow());

    expect(projektPoDodaniu).not.toBe(projekt);
    expect(projekt.media).toEqual([]);
  });

  it("nie mutuje starej tablicy mediow", () => {
    const istniejacyPlik = utworzPlikMediow({ id: "media-1" });
    const stareMedia = [istniejacyPlik];
    const projekt = {
      ...utworzPustyProjekt("Projekt testowy"),
      media: stareMedia
    };

    const projektPoDodaniu = dodajMediumDoProjektu(
      projekt,
      utworzPlikMediow({ id: "media-2" })
    );

    expect(projektPoDodaniu.media).not.toBe(stareMedia);
    expect(stareMedia).toEqual([istniejacyPlik]);
  });

  it("nie dodaje duplikatu medium o tym samym id", () => {
    const istniejacyPlik = utworzPlikMediow({ id: "media-1" });
    const nowszyPlik = utworzPlikMediow({
      id: "media-1",
      nazwaPliku: "nowsze.mp4",
      sciezkaPliku: "nowsze.mp4"
    });
    const projekt = {
      ...utworzPustyProjekt("Projekt testowy"),
      media: [istniejacyPlik]
    };

    const projektPoDodaniu = dodajMediumDoProjektu(projekt, nowszyPlik);

    expect(projektPoDodaniu.media).toEqual([nowszyPlik]);
  });

  it("aktualizuje metadane medium po id", () => {
    const plikMediow = utworzPlikMediow({ id: "media-1" });
    const metadane = utworzMetadaneWideo();
    const projekt = {
      ...utworzPustyProjekt("Projekt testowy"),
      media: [plikMediow]
    };

    const projektPoAktualizacji = zaktualizujMetadaneMediumWProjekcie(
      projekt,
      "media-1",
      metadane
    );

    expect(projektPoAktualizacji.media[0]?.metadane).toEqual(metadane);
  });

  it("zwraca niezmieniony projekt przy blednym id medium", () => {
    const projekt = {
      ...utworzPustyProjekt("Projekt testowy"),
      media: [utworzPlikMediow({ id: "media-1" })]
    };

    const projektPoAktualizacji = zaktualizujMetadaneMediumWProjekcie(
      projekt,
      "brak-medium",
      utworzMetadaneWideo()
    );

    expect(projektPoAktualizacji).toBe(projekt);
  });

  it("nie mutuje starego projektu przy aktualizacji metadanych", () => {
    const plikMediow = utworzPlikMediow({ id: "media-1" });
    const stareMedia = [plikMediow];
    const projekt = {
      ...utworzPustyProjekt("Projekt testowy"),
      media: stareMedia
    };

    const projektPoAktualizacji = zaktualizujMetadaneMediumWProjekcie(
      projekt,
      "media-1",
      utworzMetadaneWideo()
    );

    expect(projektPoAktualizacji).not.toBe(projekt);
    expect(projektPoAktualizacji.media).not.toBe(stareMedia);
    expect(projekt.media).toEqual([plikMediow]);
  });

  it("zachowuje date utworzenia i aktualizuje date modyfikacji", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-04T10:00:00.000Z"));
    const projekt = {
      ...utworzPustyProjekt("Projekt testowy"),
      media: [utworzPlikMediow({ id: "media-1" })]
    };

    vi.setSystemTime(new Date("2026-07-04T11:00:00.000Z"));
    const projektPoAktualizacji = zaktualizujMetadaneMediumWProjekcie(
      projekt,
      "media-1",
      utworzMetadaneWideo()
    );

    expect(projektPoAktualizacji.dataUtworzeniaIso).toBe(
      projekt.dataUtworzeniaIso
    );
    expect(projektPoAktualizacji.dataModyfikacjiIso).toBe(
      "2026-07-04T11:00:00.000Z"
    );
  });

  it("przenosi czas trwania z metadanych do pola medium", () => {
    const projekt = {
      ...utworzPustyProjekt("Projekt testowy"),
      media: [utworzPlikMediow({ id: "media-1", czasTrwaniaMs: undefined })]
    };

    const projektPoAktualizacji = zaktualizujMetadaneMediumWProjekcie(
      projekt,
      "media-1",
      utworzMetadaneWideo({ czasTrwaniaMs: 90000 })
    );

    expect(projektPoAktualizacji.media[0]?.czasTrwaniaMs).toBe(90000);
  });

  it("zapisuje propozycje ciec w stanie projektu", () => {
    const projekt = utworzPustyProjekt("Projekt testowy");
    const propozycjeCiec = [utworzPropozycjeCiecia()];

    const projektPoAktualizacji = zaktualizujPropozycjeCiecWProjekcie(
      projekt,
      propozycjeCiec
    );

    expect(projektPoAktualizacji.timeline.propozycjeCiec).toBe(
      propozycjeCiec
    );
    expect(projektPoAktualizacji).not.toBe(projekt);
    expect(projekt.timeline.propozycjeCiec).toEqual([]);
  });

  it("dodaje pierwsze medium na pusty timeline", () => {
    const plikMediow = utworzPlikMediow({
      id: "media-1",
      metadane: utworzMetadaneWideo({ czasTrwaniaMs: 9000 })
    });
    const projekt = {
      ...utworzPustyProjekt("Projekt testowy"),
      media: [plikMediow]
    };

    const projektPoDodaniu = pobierzProjektZWynikuDodania(
      dodajMediumNaTimeline(projekt, "media-1")
    );

    expect(projektPoDodaniu.timeline.klipy).toHaveLength(1);
    expect(projektPoDodaniu.timeline.klipy[0]).toMatchObject({
      idPlikuMediow: "media-1",
      rodzaj: "wideo",
      czasStartuMs: 0,
      czasTrwaniaMs: 9000,
      zrodloStartMs: 0,
      zrodloKoniecMs: 9000
    });
    expect(projekt.timeline.klipy).toEqual([]);
  });

  it("dodaje drugie medium na koniec timeline", () => {
    const pierwszyPlik = utworzPlikMediow({
      id: "media-1",
      metadane: utworzMetadaneWideo({ czasTrwaniaMs: 7000 })
    });
    const drugiPlik = utworzPlikMediow({
      id: "media-2",
      nazwaPliku: "drugie.mp4",
      sciezkaPliku: "drugie.mp4",
      metadane: utworzMetadaneWideo({ czasTrwaniaMs: 4000 })
    });
    const projekt = {
      ...utworzPustyProjekt("Projekt testowy"),
      media: [pierwszyPlik, drugiPlik]
    };
    const projektZPierwszymKlipem = pobierzProjektZWynikuDodania(
      dodajMediumNaTimeline(projekt, "media-1")
    );

    const projektZDrugimKlipem = pobierzProjektZWynikuDodania(
      dodajMediumNaTimeline(projektZPierwszymKlipem, "media-2")
    );

    expect(projektZDrugimKlipem.timeline.klipy[1]).toMatchObject({
      idPlikuMediow: "media-2",
      czasStartuMs: 7000,
      czasTrwaniaMs: 4000
    });
  });

  it("dodaje to samo medium drugi raz jako nowy klip", () => {
    const plikMediow = utworzPlikMediow({
      id: "media-1",
      metadane: utworzMetadaneWideo({ czasTrwaniaMs: 6000 })
    });
    const projekt = {
      ...utworzPustyProjekt("Projekt testowy"),
      media: [plikMediow]
    };
    const projektZPierwszymKlipem = pobierzProjektZWynikuDodania(
      dodajMediumNaTimeline(projekt, "media-1")
    );

    const projektZDrugimKlipem = pobierzProjektZWynikuDodania(
      dodajMediumNaTimeline(projektZPierwszymKlipem, "media-1")
    );

    expect(projektZDrugimKlipem.timeline.klipy).toHaveLength(2);
    expect(projektZDrugimKlipem.timeline.klipy[0]?.id).not.toBe(
      projektZDrugimKlipem.timeline.klipy[1]?.id
    );
    expect(projektZDrugimKlipem.timeline.klipy[1]).toMatchObject({
      idPlikuMediow: "media-1",
      czasStartuMs: 6000,
      czasTrwaniaMs: 6000
    });
  });

  it("zwraca blad dla nieistniejacego id medium", () => {
    const projekt = utworzPustyProjekt("Projekt testowy");

    const wynik = dodajMediumNaTimeline(projekt, "brak-medium");

    expect(wynik).toEqual({
      czySukces: false,
      bledy: [
        {
          pole: "idMedium",
          komunikat: "Nie znaleziono medium w bibliotece projektu."
        }
      ]
    });
  });

  it("dodaje grafike z domyslna dlugoscia", () => {
    const plikGrafiki = utworzPlikMediow({
      id: "grafika-1",
      nazwaPliku: "plansza.png",
      sciezkaPliku: "plansza.png",
      rozszerzenie: ".png",
      typMime: "image/png",
      typ: "grafika"
    });
    const projekt = {
      ...utworzPustyProjekt("Projekt testowy"),
      media: [plikGrafiki]
    };

    const projektPoDodaniu = pobierzProjektZWynikuDodania(
      dodajMediumNaTimeline(projekt, "grafika-1")
    );

    expect(projektPoDodaniu.timeline.klipy[0]).toMatchObject({
      idPlikuMediow: "grafika-1",
      rodzaj: "grafika",
      czasStartuMs: 0,
      czasTrwaniaMs: 5000
    });
  });

  it("dodaje wideo z dlugoscia z metadanych", () => {
    const plikMediow = utworzPlikMediow({
      id: "media-1",
      czasTrwaniaMs: 3000,
      metadane: utworzMetadaneWideo({ czasTrwaniaMs: 11_000 })
    });
    const projekt = {
      ...utworzPustyProjekt("Projekt testowy"),
      media: [plikMediow]
    };

    const projektPoDodaniu = pobierzProjektZWynikuDodania(
      dodajMediumNaTimeline(projekt, "media-1")
    );

    expect(projektPoDodaniu.timeline.klipy[0]?.czasTrwaniaMs).toBe(11_000);
    expect(projektPoDodaniu.timeline.klipy[0]?.zrodloKoniecMs).toBe(11_000);
  });

  it("odrzuca niepoprawne metadane bez zmiany projektu", () => {
    const projekt = {
      ...utworzPustyProjekt("Projekt testowy"),
      media: [utworzPlikMediow({ id: "media-1" })]
    };

    const projektPoAktualizacji = zaktualizujMetadaneMediumWProjekcie(
      projekt,
      "media-1",
      utworzMetadaneWideo({ czasTrwaniaMs: -1 })
    );

    expect(projektPoAktualizacji).toBe(projekt);
  });
});
