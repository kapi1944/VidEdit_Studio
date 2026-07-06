import { describe, expect, it } from "vitest";

import { pobierzWidocznoscFunkcjiDlaTrybu } from "../../../src/aplikacja/ustawieniaInterfejsu";

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
