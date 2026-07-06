import { describe, expect, it } from "vitest";

import {
  czySkrotCieciaTimeline,
  czySkrotyTimelineDozwolone
} from "../../../src/aplikacja/skrotyTimeline";

describe("skroty timeline", () => {
  it("pozwala uzyc skrotu poza polem edycji", () => {
    const element = document.createElement("div");

    expect(czySkrotyTimelineDozwolone(element)).toBe(true);
  });

  it("blokuje skroty w input", () => {
    expect(czySkrotyTimelineDozwolone(document.createElement("input"))).toBe(
      false
    );
  });

  it("blokuje skroty w textarea", () => {
    expect(czySkrotyTimelineDozwolone(document.createElement("textarea"))).toBe(
      false
    );
  });

  it("blokuje skroty w select", () => {
    expect(czySkrotyTimelineDozwolone(document.createElement("select"))).toBe(
      false
    );
  });

  it("rozpoznaje skrot ciecia timeline", () => {
    expect(
      czySkrotCieciaTimeline({
        altKey: false,
        ctrlKey: false,
        key: "S",
        metaKey: false
      })
    ).toBe(true);
  });

  it("ignoruje skrot ciecia z modyfikatorem", () => {
    expect(
      czySkrotCieciaTimeline({
        altKey: false,
        ctrlKey: true,
        key: "s",
        metaKey: false
      })
    ).toBe(false);
  });
});
