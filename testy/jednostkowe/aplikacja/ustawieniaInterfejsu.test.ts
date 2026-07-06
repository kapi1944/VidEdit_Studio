import { describe, expect, it } from "vitest";

import {
  ograniczSzerokoscPaneluLewego,
  ograniczSzerokoscPaneluPrawego,
  ograniczWysokoscTimeline,
  pobierzOgraniczoneRozmiaryLayoutu,
  pobierzWidocznoscFunkcjiDlaTrybu
} from "../../../src/aplikacja/ustawieniaInterfejsu";

describe("pobierzWidocznoscFunkcjiDlaTrybu", () => {
  it("pokazuje panel szybkich akcji w trybie LITE", () => {
    const widocznoscFunkcji = pobierzWidocznoscFunkcjiDlaTrybu("lite");

    expect(widocznoscFunkcji.pokazPanelSzybkichAkcji).toBe(true);
  });

  it("pokazuje zaawansowane ustawienia w trybie PRO", () => {
    const widocznoscFunkcji = pobierzWidocznoscFunkcjiDlaTrybu("pro");

    expect(widocznoscFunkcji.pokazZaawansowaneUstawieniaTimeline).toBe(true);
  });
});

describe("ograniczanie rozmiarow layoutu", () => {
  it("nie pozwala zgniesc paneli ponizej minimum", () => {
    expect(ograniczSzerokoscPaneluLewego(120)).toBe(220);
    expect(ograniczSzerokoscPaneluPrawego(120)).toBe(300);
    expect(ograniczWysokoscTimeline(90)).toBe(180);
  });

  it("nie pozwala rozciagnac paneli powyzej maksimum", () => {
    expect(ograniczSzerokoscPaneluLewego(900)).toBe(420);
    expect(ograniczSzerokoscPaneluPrawego(900)).toBe(560);
    expect(ograniczWysokoscTimeline(900)).toBe(360);
  });

  it("uzupelnia brakujace rozmiary wartosciami domyslnymi", () => {
    expect(
      pobierzOgraniczoneRozmiaryLayoutu({
        szerokoscPaneluLewegoPx: 360
      })
    ).toEqual({
      szerokoscPaneluLewegoPx: 360,
      szerokoscPaneluPrawegoPx: 420,
      wysokoscTimelinePx: 220
    });
  });
});
