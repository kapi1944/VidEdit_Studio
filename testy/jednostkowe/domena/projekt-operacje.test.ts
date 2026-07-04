import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  MetadaneWideo,
  PlikMediow
} from "../../../src/domena/media/typyMediow";
import type { PropozycjaCiecia } from "../../../src/domena/timeline/typyTimeline";
import { utworzPustyProjekt } from "../../../src/domena/projekt/fabrykaProjektu";
import {
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

  it("zastepuje poprzednie medium przy imporcie drugiego pliku wideo", () => {
    const pierwszyPlik = utworzPlikMediow({ id: "media-1" });
    const drugiPlik = utworzPlikMediow({
      id: "media-2",
      nazwaPliku: "drugie.mp4",
      sciezkaPliku: "drugie.mp4"
    });
    const projekt = {
      ...utworzPustyProjekt("Projekt testowy"),
      media: [pierwszyPlik]
    };

    const projektPoDodaniu = dodajMediumDoProjektu(projekt, drugiPlik);

    expect(projektPoDodaniu.media).toEqual([drugiPlik]);
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
    const pierwszyPlik = utworzPlikMediow({ id: "media-1" });
    const stareMedia = [pierwszyPlik];
    const projekt = {
      ...utworzPustyProjekt("Projekt testowy"),
      media: stareMedia
    };

    const projektPoDodaniu = dodajMediumDoProjektu(
      projekt,
      utworzPlikMediow({ id: "media-2" })
    );

    expect(projektPoDodaniu.media).not.toBe(stareMedia);
    expect(stareMedia).toEqual([pierwszyPlik]);
  });

  it("nie dodaje duplikatu medium o tym samym id", () => {
    const pierwszyPlik = utworzPlikMediow({ id: "media-1" });
    const nowszyPlik = utworzPlikMediow({
      id: "media-1",
      nazwaPliku: "nowsze.mp4",
      sciezkaPliku: "nowsze.mp4"
    });
    const projekt = {
      ...utworzPustyProjekt("Projekt testowy"),
      media: [pierwszyPlik]
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
