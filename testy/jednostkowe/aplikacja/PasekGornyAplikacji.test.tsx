import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  PasekGornyAplikacji,
  opiszStatusZapisuProjektu,
  pobierzNazweProjektuDoPaska,
  sprawdzCzyEksportJestDostepny
} from "../../../src/aplikacja/komponenty/AplikacjaVidEdit";

describe("PasekGornyAplikacji", () => {
  it("pokazuje nazwe zastepcza przy braku projektu", () => {
    expect(pobierzNazweProjektuDoPaska()).toBe("Nowy projekt");
    expect(pobierzNazweProjektuDoPaska("   ")).toBe("Nowy projekt");
  });

  it("opisuje projekt roboczy jako bezpieczny placeholder zapisu", () => {
    expect(opiszStatusZapisuProjektu("roboczy")).toEqual({
      etykieta: "projekt roboczy",
      tytul:
        "Projekt roboczy - zapis projektu zostanie dopracowany w kolejnym etapie."
    });
  });

  it("wylacza eksport przy braku filmu i zaakceptowanych ciec", () => {
    const widok = renderToStaticMarkup(
      <PasekGornyAplikacji
        statusZapisu="roboczy"
        trybWygladu="ciemny"
        czyEksportDostepny={false}
        naZmianeTrybuWygladu={vi.fn()}
        naEksportuj={vi.fn()}
      />
    );

    expect(sprawdzCzyEksportJestDostepny(false, false)).toBe(false);
    expect(widok).toContain("Nowy projekt");
    expect(widok).toContain("Tryb: Czyszczenie ciszy");
    expect(widok).toContain("Eksport bedzie dostepny po dodaniu filmu.");
    expect(widok).toContain("disabled=\"\"");
  });

  it("wlacza eksport, gdy film jest dostepny", () => {
    const widok = renderToStaticMarkup(
      <PasekGornyAplikacji
        nazwaProjektu="Kurs montazu"
        statusZapisu="roboczy"
        trybWygladu="ciemny"
        czyEksportDostepny
        naZmianeTrybuWygladu={vi.fn()}
        naEksportuj={vi.fn()}
      />
    );

    expect(sprawdzCzyEksportJestDostepny(true, false)).toBe(true);
    expect(widok).toContain("Kurs montazu");
    expect(widok).toContain("Eksport filmu jest placeholderem tego etapu.");
    expect(widok).not.toContain(
      "class=\"pasek-gorny-aplikacji__eksport\" disabled"
    );
  });

  it("wlacza eksport, gdy istnieja zaakceptowane ciecia", () => {
    expect(sprawdzCzyEksportJestDostepny(false, true)).toBe(true);
  });
});
