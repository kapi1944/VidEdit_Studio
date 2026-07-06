import { describe, expect, it } from "vitest";

import {
  DOMYSLNE_USTAWIENIA_WYKRYWANIA_CISZY,
  listaPresetowWykrywaniaCiszy,
  pobierzPresetWykrywaniaCiszy,
  walidujUstawieniaWykrywaniaCiszy
} from "../../../../src/moduly/cisza/indeksCiszy";

describe("ustawienia wykrywania ciszy", () => {
  it("udostepnia trzy presety", () => {
    expect(listaPresetowWykrywaniaCiszy.map((preset) => preset.id)).toEqual([
      "delikatny",
      "normalny",
      "agresywny"
    ]);
  });

  it("zwraca domyslne ustawienia dla presetu normalnego", () => {
    expect(pobierzPresetWykrywaniaCiszy("normalny")).toEqual(
      DOMYSLNE_USTAWIENIA_WYKRYWANIA_CISZY
    );
  });

  it("waliduje zakres progu ciszy", () => {
    const bledy = walidujUstawieniaWykrywaniaCiszy({
      ...DOMYSLNE_USTAWIENIA_WYKRYWANIA_CISZY,
      progCiszyDb: -90
    });

    expect(bledy).toContainEqual(
      expect.objectContaining({ pole: "progCiszyDb" })
    );
  });

  it("waliduje zakres minimalnej dlugosci ciszy", () => {
    const bledy = walidujUstawieniaWykrywaniaCiszy({
      ...DOMYSLNE_USTAWIENIA_WYKRYWANIA_CISZY,
      minimalnaDlugoscCiszyMs: 50
    });

    expect(bledy).toContainEqual(
      expect.objectContaining({ pole: "minimalnaDlugoscCiszyMs" })
    );
  });

  it("akceptuje domyslne ustawienia", () => {
    expect(
      walidujUstawieniaWykrywaniaCiszy(
        DOMYSLNE_USTAWIENIA_WYKRYWANIA_CISZY
      )
    ).toEqual([]);
  });
});
