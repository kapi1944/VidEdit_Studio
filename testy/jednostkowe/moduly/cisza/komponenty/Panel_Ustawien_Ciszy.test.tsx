import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DOMYSLNE_USTAWIENIA_WYKRYWANIA_CISZY } from "../../../../../src/moduly/cisza/indeksCiszy";
import { Panel_Ustawien_Ciszy } from "../../../../../src/moduly/cisza/komponenty/Panel_Ustawien_Ciszy";

const pobierzStatusFfmpegZLokalnegoMostu = vi.hoisted(() => vi.fn());

vi.mock("../../../../../src/infrastruktura/lokalny-most/klientLokalnegoMostu", () => ({
  BladLokalnegoMostu: class BladLokalnegoMostu extends Error {
    constructor(komunikat: string) {
      super(komunikat);
      this.name = "BladLokalnegoMostu";
    }
  },
  pobierzStatusFfmpegZLokalnegoMostu
}));

let korzen: Root | undefined;
let kontener: HTMLDivElement | undefined;

function wyrenderujPanelUstawienCiszy() {
  kontener = document.createElement("div");
  document.body.appendChild(kontener);
  korzen = createRoot(kontener);

  act(() => {
    korzen?.render(
      <Panel_Ustawien_Ciszy
        ustawienia={DOMYSLNE_USTAWIENIA_WYKRYWANIA_CISZY}
        naZmianeUstawien={vi.fn()}
      />
    );
  });
}

afterEach(() => {
  act(() => {
    korzen?.unmount();
  });
  kontener?.remove();
  korzen = undefined;
  kontener = undefined;
  vi.clearAllMocks();
});

describe("Panel_Ustawien_Ciszy", () => {
  it("pokazuje status FFmpeg po kliknieciu diagnostyki", async () => {
    pobierzStatusFfmpegZLokalnegoMostu.mockResolvedValue({
      czyFfmpegDostepny: true,
      czyFfprobeDostepny: true,
      wersjaFfmpeg: "ffmpeg version 7.1",
      wersjaFfprobe: "ffprobe version 7.1",
      blad: null
    });
    wyrenderujPanelUstawienCiszy();

    const przycisk = Array.from(kontener?.querySelectorAll("button") ?? []).find(
      (element) => element.textContent === "Sprawdz FFmpeg"
    );

    await act(async () => {
      przycisk?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(pobierzStatusFfmpegZLokalnegoMostu).toHaveBeenCalledTimes(1);
    expect(kontener?.textContent).toContain("FFmpeg dostepny");
    expect(kontener?.textContent).toContain("FFprobe dostepny");
  });

  it("pokazuje niedostepny most przy bledzie klienta", async () => {
    pobierzStatusFfmpegZLokalnegoMostu.mockRejectedValue(
      new Error("Nie udalo sie polaczyc z lokalnym mostem FFmpeg.")
    );
    wyrenderujPanelUstawienCiszy();

    const przycisk = Array.from(kontener?.querySelectorAll("button") ?? []).find(
      (element) => element.textContent === "Sprawdz FFmpeg"
    );

    await act(async () => {
      przycisk?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(kontener?.textContent).toContain("Most niedostepny");
    expect(kontener?.textContent).toContain(
      "Blad: Nie udalo sie polaczyc z lokalnym mostem FFmpeg."
    );
  });
});