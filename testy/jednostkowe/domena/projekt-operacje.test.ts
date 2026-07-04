import { afterEach, describe, expect, it, vi } from "vitest";
import type { PlikMediow } from "../../../src/domena/media/typyMediow";
import { utworzPustyProjekt } from "../../../src/domena/projekt/fabrykaProjektu";
import { dodajMediumDoProjektu } from "../../../src/domena/projekt/operacjeProjektu";

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
});
