import { describe, expect, it } from "vitest";
import { utworzDaneImportuZPlikuBrowserowego } from "../../../src/infrastruktura/media/utworzDaneImportuZPlikuBrowserowego";

describe("browserowy adapter mediow", () => {
  it("konwertuje File na dane importu pliku mediowego", () => {
    const plik = new File(["test"], "nagranie.mp4", {
      type: "video/mp4"
    });

    expect(utworzDaneImportuZPlikuBrowserowego(plik)).toEqual({
      nazwaPliku: "nagranie.mp4",
      sciezkaPliku: "nagranie.mp4",
      rozmiarBajtow: 4
    });
  });

  it("obsluguje polskie znaki w nazwie pliku", () => {
    const plik = new File(["test"], "nagranie_żółć_ąę.mp4", {
      type: "video/mp4"
    });

    expect(utworzDaneImportuZPlikuBrowserowego(plik).nazwaPliku).toBe(
      "nagranie_żółć_ąę.mp4"
    );
    expect(utworzDaneImportuZPlikuBrowserowego(plik).sciezkaPliku).toBe(
      "nagranie_żółć_ąę.mp4"
    );
  });
});
