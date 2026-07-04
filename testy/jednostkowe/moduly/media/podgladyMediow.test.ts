import { describe, expect, it } from "vitest";

import {
  dodajLubZaktualizujPodgladMedium,
  type PodgladMedium,
  type PodgladyMediow
} from "../../../../src/moduly/media/typyPodgladuMediow";

const podgladPierwszegoMedium: PodgladMedium = {
  idMedium: "medium-1",
  objectUrl: "blob:http://localhost/medium-1",
  miniaturaDataUrl: "data:image/jpeg;base64,pierwsza",
  statusMiniatury: "gotowe"
};

const podgladDrugiegoMedium: PodgladMedium = {
  idMedium: "medium-2",
  objectUrl: "blob:http://localhost/medium-2",
  miniaturaDataUrl: "data:image/jpeg;base64/druga",
  statusMiniatury: "gotowe"
};

describe("podglady mediow", () => {
  it("dodaje podglad dla jednego medium", () => {
    const podglady = dodajLubZaktualizujPodgladMedium(
      {},
      podgladPierwszegoMedium
    );

    expect(podglady).toEqual({
      [podgladPierwszegoMedium.idMedium]: podgladPierwszegoMedium
    });
  });

  it("dodaje podglad drugiego medium i zachowuje pierwszy", () => {
    const podglady: PodgladyMediow = {
      [podgladPierwszegoMedium.idMedium]: podgladPierwszegoMedium
    };

    const zaktualizowanePodglady = dodajLubZaktualizujPodgladMedium(
      podglady,
      podgladDrugiegoMedium
    );

    expect(zaktualizowanePodglady[podgladPierwszegoMedium.idMedium]).toBe(
      podgladPierwszegoMedium
    );
    expect(zaktualizowanePodglady[podgladDrugiegoMedium.idMedium]).toBe(
      podgladDrugiegoMedium
    );
  });

  it("aktualizuje podglad tego samego medium bez duplikatu", () => {
    const nowyPodgladPierwszegoMedium: PodgladMedium = {
      idMedium: podgladPierwszegoMedium.idMedium,
      objectUrl: "blob:http://localhost/medium-1-nowy",
      miniaturaDataUrl: "data:image/jpeg;base64/nowa",
      statusMiniatury: "gotowe"
    };
    const podglady: PodgladyMediow = {
      [podgladPierwszegoMedium.idMedium]: podgladPierwszegoMedium,
      [podgladDrugiegoMedium.idMedium]: podgladDrugiegoMedium
    };

    const zaktualizowanePodglady = dodajLubZaktualizujPodgladMedium(
      podglady,
      nowyPodgladPierwszegoMedium
    );

    expect(Object.keys(zaktualizowanePodglady)).toHaveLength(2);
    expect(zaktualizowanePodglady[podgladPierwszegoMedium.idMedium]).toBe(
      nowyPodgladPierwszegoMedium
    );
    expect(zaktualizowanePodglady[podgladDrugiegoMedium.idMedium]).toBe(
      podgladDrugiegoMedium
    );
  });
});
