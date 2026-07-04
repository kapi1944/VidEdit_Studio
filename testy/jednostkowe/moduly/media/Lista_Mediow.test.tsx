import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Lista_Mediow } from "../../../../src/moduly/media/komponenty/Lista_Mediow";
import type { PlikMediow } from "../../../../src/domena/media/typyMediow";

const pierwszeMedium: PlikMediow = {
  id: "medium-1",
  nazwaPliku: "pierwsze.mp4",
  sciezkaPliku: "",
  rozszerzenie: ".mp4",
  typMime: "video/mp4",
  rozmiarBajtow: 1024,
  statusImportu: "zaimportowany",
  typ: "wideo"
};

const drugieMedium: PlikMediow = {
  id: "medium-2",
  nazwaPliku: "drugie.mp4",
  sciezkaPliku: "",
  rozszerzenie: ".mp4",
  typMime: "video/mp4",
  rozmiarBajtow: 2048,
  statusImportu: "zaimportowany",
  typ: "wideo"
};

describe("Lista_Mediow", () => {
  it("renderuje miniatury przypisane do wlasciwego id medium", () => {
    const widok = renderToStaticMarkup(
      <Lista_Mediow
        media={[pierwszeMedium, drugieMedium]}
        podgladyMediow={{
          [pierwszeMedium.id]: {
            idMedium: pierwszeMedium.id,
            objectUrl: "blob:http://localhost/pierwsze",
            miniaturaDataUrl: "data:image/jpeg;base64,pierwsza",
            statusMiniatury: "gotowe"
          },
          [drugieMedium.id]: {
            idMedium: drugieMedium.id,
            objectUrl: "blob:http://localhost/drugie",
            miniaturaDataUrl: "data:image/jpeg;base64,druga",
            statusMiniatury: "gotowe"
          }
        }}
      />
    );

    expect(widok).toContain("pierwsze.mp4");
    expect(widok).toContain("drugie.mp4");
    expect(widok).toContain("data:image/jpeg;base64,pierwsza");
    expect(widok).toContain("data:image/jpeg;base64,druga");
  });

  it("pokazuje placeholder, gdy medium nie ma miniatury", () => {
    const widok = renderToStaticMarkup(
      <Lista_Mediow media={[pierwszeMedium]} podgladyMediow={{}} />
    );

    expect(widok).toContain("Brak miniatury");
  });
});
