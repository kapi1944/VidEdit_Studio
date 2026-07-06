import { describe, expect, it } from "vitest";

import {
  domyslnyTrybPodgladu,
  etykietyTrybuPodgladu,
  sprawdzCzyTrybPodgladuJestPoprawny
} from "../../../src/aplikacja/trybyPodgladu";

describe("tryby podgladu", () => {
  it("domyslnie wybiera timeline", () => {
    expect(domyslnyTrybPodgladu).toBe("timeline");
  });

  it("udostepnia etykiety przelacznika podgladu", () => {
    expect(etykietyTrybuPodgladu).toEqual({
      klip: "Klip",
      timeline: "Timeline",
      dzielony: "Dzielony"
    });
  });

  it("rozpoznaje poprawne i bledne tryby", () => {
    expect(sprawdzCzyTrybPodgladuJestPoprawny("klip")).toBe(true);
    expect(sprawdzCzyTrybPodgladuJestPoprawny("timeline")).toBe(true);
    expect(sprawdzCzyTrybPodgladuJestPoprawny("dzielony")).toBe(true);
    expect(sprawdzCzyTrybPodgladuJestPoprawny("program")).toBe(false);
  });
});
