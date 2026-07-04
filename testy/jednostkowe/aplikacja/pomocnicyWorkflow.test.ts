import { describe, expect, it } from "vitest";

import {
  utworzKrokiWorkflow,
  type DaneWorkflow,
  type IdKrokuWorkflow
} from "../../../src/aplikacja/komponenty/pomocnicyWorkflow";

const domyslneDaneWorkflow: DaneWorkflow = {
  liczbaMediow: 0,
  statusImportuMediow: "bezczynny",
  liczbaSegmentowCiszy: 0,
  liczbaPropozycjiCiec: 0,
  liczbaPropozycjiOczekujacych: 0,
  liczbaPropozycjiZatwierdzonych: 0,
  liczbaPropozycjiOdrzuconych: 0
};

function pobierzStatusKroku(
  idKroku: IdKrokuWorkflow,
  nadpisaneDane: Partial<DaneWorkflow> = {}
) {
  const krokiWorkflow = utworzKrokiWorkflow({
    ...domyslneDaneWorkflow,
    ...nadpisaneDane
  });

  return krokiWorkflow.find((krokWorkflow) => krokWorkflow.id === idKroku)
    ?.status;
}

describe("pomocnicyWorkflow", () => {
  it("ustawia import jako aktywny przy braku mediow", () => {
    expect(pobierzStatusKroku("import-mediow")).toBe("aktywny");
  });

  it("ustawia import jako gotowy, gdy media istnieja", () => {
    expect(pobierzStatusKroku("import-mediow", { liczbaMediow: 1 })).toBe(
      "gotowe"
    );
  });

  it("ustawia import jako blad przy bledzie importu", () => {
    expect(
      pobierzStatusKroku("import-mediow", {
        liczbaMediow: 1,
        statusImportuMediow: "blad"
      })
    ).toBe("blad");
  });

  it("ustawia wykrycie ciszy jako gotowe, gdy segmenty istnieja", () => {
    expect(
      pobierzStatusKroku("wykrycie-ciszy", {
        liczbaMediow: 1,
        liczbaSegmentowCiszy: 2
      })
    ).toBe("gotowe");
  });

  it("ustawia decyzje ciec jako aktywne przy oczekujacych propozycjach", () => {
    expect(
      pobierzStatusKroku("decyzje-ciec", {
        liczbaPropozycjiCiec: 2,
        liczbaPropozycjiOczekujacych: 1
      })
    ).toBe("aktywny");
  });

  it("ustawia decyzje ciec jako gotowe, gdy wszystkie propozycje sa rozpatrzone", () => {
    expect(
      pobierzStatusKroku("decyzje-ciec", {
        liczbaPropozycjiCiec: 2,
        liczbaPropozycjiOczekujacych: 0,
        liczbaPropozycjiZatwierdzonych: 1,
        liczbaPropozycjiOdrzuconych: 1
      })
    ).toBe("gotowe");
  });

  it("pozostawia eksport jako placeholder", () => {
    expect(pobierzStatusKroku("eksport", { liczbaMediow: 1 })).toBe(
      "placeholder"
    );
  });

  it("nazywa krok importu importem mediow", () => {
    const [krokImportu] = utworzKrokiWorkflow(domyslneDaneWorkflow);

    expect(krokImportu).toMatchObject({
      id: "import-mediow",
      nazwa: "Import mediow"
    });
    expect(krokImportu?.opis).not.toContain("jeden film");
  });
});
