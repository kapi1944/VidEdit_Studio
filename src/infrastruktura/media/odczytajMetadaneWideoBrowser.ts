import {
  pobierzRozszerzeniePliku,
  sprawdzCzyRozszerzenieWideoJestObslugiwane
} from "../../domena/media/rozszerzeniaWideo";
import type { MetadaneWideo } from "../../domena/media/typyMediow";
import { zwalidujMetadaneWideo } from "../../domena/media/walidacjaMetadanychWideo";

function sprawdzCzyPlikWygladaNaWideo(plik: File): boolean {
  const typMime = plik.type.trim().toLowerCase();

  if (typMime.startsWith("video/")) {
    return true;
  }

  return sprawdzCzyRozszerzenieWideoJestObslugiwane(
    pobierzRozszerzeniePliku(plik.name)
  );
}

function utworzBladOdczytuMetadanych(): Error {
  return new Error("Nie udało się odczytać metadanych wideo.");
}

export function odczytajMetadaneWideoZPliku(
  plik: File
): Promise<MetadaneWideo> {
  if (!sprawdzCzyPlikWygladaNaWideo(plik)) {
    return Promise.reject(new Error("Plik nie jest obsługiwanym wideo."));
  }

  const objectUrl = URL.createObjectURL(plik);

  return new Promise<MetadaneWideo>((resolve, reject) => {
    const elementWideo = document.createElement("video");
    let czyZakonczono = false;

    function zakoncz(
      wynik: "sukces" | "blad",
      metadane?: MetadaneWideo
    ) {
      if (czyZakonczono) {
        return;
      }

      czyZakonczono = true;
      elementWideo.onloadedmetadata = null;
      elementWideo.onerror = null;
      URL.revokeObjectURL(objectUrl);

      if (wynik === "sukces" && metadane) {
        resolve(metadane);
        return;
      }

      reject(utworzBladOdczytuMetadanych());
    }

    try {
      elementWideo.preload = "metadata";
      elementWideo.onloadedmetadata = () => {
        const metadane: MetadaneWideo = {
          czasTrwaniaMs: Math.round(elementWideo.duration * 1000),
          szerokoscPx: elementWideo.videoWidth,
          wysokoscPx: elementWideo.videoHeight,
          czyMetadanePelne: false
        };

        if (zwalidujMetadaneWideo(metadane).length > 0) {
          zakoncz("blad");
          return;
        }

        zakoncz("sukces", metadane);
      };
      elementWideo.onerror = () => zakoncz("blad");
      elementWideo.src = objectUrl;
      elementWideo.load();
    } catch {
      zakoncz("blad");
    }
  });
}
