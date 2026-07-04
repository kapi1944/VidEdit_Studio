import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  PasekGornyAplikacji,
  pobierzNazweProjektuDoPaska
} from "../../../src/aplikacja/komponenty/AplikacjaVidEdit";
import {
  czyEksportDostepnyWUi,
  czyHistoriaDostepnaWUi,
  okreslStatusProjektuUi,
  tytulPlaceholderaEksportu,
  tytulPlaceholderaHistorii
} from "../../../src/aplikacja/komponenty/pomocnicyPaskaGornego";

describe("PasekGornyAplikacji", () => {
  it("pokazuje nazwe zastepcza przy braku projektu", () => {
    expect(pobierzNazweProjektuDoPaska()).toBe("Projekt bez nazwy");
    expect(pobierzNazweProjektuDoPaska("   ")).toBe("Projekt bez nazwy");
  });

  it("ustawia status brak mediow przy pustym projekcie", () => {
    expect(
      okreslStatusProjektuUi({
        liczbaMediow: 0,
        statusImportuMediow: "bezczynny"
      })
    ).toBe("brak_filmu");
  });

  it("ustawia status gotowe, gdy media istnieja", () => {
    expect(
      okreslStatusProjektuUi({
        liczbaMediow: 1,
        statusImportuMediow: "gotowe"
      })
    ).toBe("gotowe");
  });

  it("ustawia status blad przy bledzie importu", () => {
    expect(
      okreslStatusProjektuUi({
        liczbaMediow: 1,
        statusImportuMediow: "blad"
      })
    ).toBe("blad");
  });

  it("ustawia status trwajacej operacji podczas importu", () => {
    expect(
      okreslStatusProjektuUi({
        liczbaMediow: 0,
        statusImportuMediow: "odczyt_metadanych"
      })
    ).toBe("trwa_operacja");
  });

  it("wylacza eksport, gdy nie ma realnej akcji eksportu", () => {
    expect(
      czyEksportDostepnyWUi({
        liczbaMediow: 1
      })
    ).toBe(false);
  });

  it("wylacza eksport przy braku mediow", () => {
    expect(
      czyEksportDostepnyWUi({
        liczbaMediow: 0,
        czyRealnyEksportDostepny: true
      })
    ).toBe(false);
  });

  it("pozostawia historie jako placeholder", () => {
    expect(czyHistoriaDostepnaWUi()).toBe(false);
  });

  it("pokazuje status projektu i placeholdery akcji", () => {
    const widok = renderToStaticMarkup(
      <PasekGornyAplikacji
        statusProjektuUi="brak_filmu"
        trybWygladu="ciemny"
        liczbaMediow={0}
        naZmianeTrybuWygladu={vi.fn()}
      />
    );

    expect(widok).toContain("Projekt bez nazwy");
    expect(widok).toContain("Brak mediow");
    expect(widok).toContain("Tryb: Czyszczenie ciszy");
    expect(widok).toContain(tytulPlaceholderaHistorii);
    expect(widok).toContain(tytulPlaceholderaEksportu);
    expect(widok).toContain("disabled=\"\"");
  });

  it("nie pokazuje zapisanego projektu bez realnego zapisu", () => {
    const widok = renderToStaticMarkup(
      <PasekGornyAplikacji
        nazwaProjektu="Kurs montazu"
        statusProjektuUi="gotowe"
        trybWygladu="ciemny"
        liczbaMediow={1}
        naZmianeTrybuWygladu={vi.fn()}
      />
    );

    expect(widok).toContain("Kurs montazu");
    expect(widok).toContain("Gotowe");
    expect(widok).not.toContain("Zapisano");
    expect(widok).not.toContain("zapisano");
    expect(widok).toContain(
      "class=\"pasek-gorny-aplikacji__eksport\" disabled"
    );
  });

  it("wlacza eksport dopiero przy realnej akcji i mediach", () => {
    expect(
      czyEksportDostepnyWUi({
        liczbaMediow: 1,
        czyRealnyEksportDostepny: true
      })
    ).toBe(true);
  });
});
