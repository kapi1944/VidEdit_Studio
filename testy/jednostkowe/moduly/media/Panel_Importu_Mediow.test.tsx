import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { Panel_Importu_Mediow } from "../../../../src/moduly/media/komponenty/Panel_Importu_Mediow";

describe("Panel_Importu_Mediow", () => {
  it("opisuje aktualny import jako pojedynczy plik wideo", () => {
    const widok = renderToStaticMarkup(
      <Panel_Importu_Mediow
        rozszerzeniaWideo={[".mp4", ".webm", ".mov", ".mkv"]}
        statusImportuMediow="bezczynny"
        naWybranoPlik={vi.fn()}
      />
    );

    expect(widok).toContain("Import mediow");
    expect(widok).toContain("Obecnie import dziala dla pojedynczego pliku wideo.");
    expect(widok).not.toContain("Import wielu plikow naraz");
    expect(widok).not.toContain("grafik zostanie");
    expect(widok).toContain("Wybierz plik wideo");
  });
});
