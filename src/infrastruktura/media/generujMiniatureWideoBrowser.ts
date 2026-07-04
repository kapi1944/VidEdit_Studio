function utworzBladMiniatury(): Error {
  return new Error("Nie udalo sie wygenerowac miniatury wideo.");
}

function narysujKlatkeNaCanvas(elementWideo: HTMLVideoElement): string {
  const szerokosc = elementWideo.videoWidth;
  const wysokosc = elementWideo.videoHeight;

  if (szerokosc <= 0 || wysokosc <= 0) {
    throw utworzBladMiniatury();
  }

  const canvas = document.createElement("canvas");
  canvas.width = szerokosc;
  canvas.height = wysokosc;

  const kontekst = canvas.getContext("2d");

  if (!kontekst) {
    throw utworzBladMiniatury();
  }

  kontekst.drawImage(elementWideo, 0, 0, szerokosc, wysokosc);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function generujMiniatureWideoZPliku(plik: File): Promise<string> {
  let objectUrl: string;

  try {
    objectUrl = URL.createObjectURL(plik);
  } catch {
    return Promise.reject(utworzBladMiniatury());
  }

  return new Promise<string>((resolve, reject) => {
    const elementWideo = document.createElement("video");
    let czyZakonczono = false;

    function zakoncz(wynik: "sukces" | "blad", miniaturaDataUrl?: string) {
      if (czyZakonczono) {
        return;
      }

      czyZakonczono = true;
      elementWideo.onloadedmetadata = null;
      elementWideo.onseeked = null;
      elementWideo.onerror = null;
      elementWideo.removeAttribute("src");
      URL.revokeObjectURL(objectUrl);

      if (wynik === "sukces" && miniaturaDataUrl) {
        resolve(miniaturaDataUrl);
        return;
      }

      reject(utworzBladMiniatury());
    }

    function obsluzGotowaKlatke() {
      try {
        zakoncz("sukces", narysujKlatkeNaCanvas(elementWideo));
      } catch {
        zakoncz("blad");
      }
    }

    try {
      elementWideo.preload = "metadata";
      elementWideo.muted = true;
      elementWideo.playsInline = true;
      elementWideo.onloadedmetadata = () => {
        const czasKlatki =
          Number.isFinite(elementWideo.duration) && elementWideo.duration > 2
            ? 1
            : 0;

        elementWideo.onseeked = obsluzGotowaKlatke;

        try {
          elementWideo.currentTime = czasKlatki;

          if (czasKlatki === 0 && elementWideo.readyState >= 2) {
            window.setTimeout(obsluzGotowaKlatke, 0);
          }
        } catch {
          zakoncz("blad");
        }
      };
      elementWideo.onerror = () => zakoncz("blad");
      elementWideo.src = objectUrl;
      elementWideo.load();
    } catch {
      zakoncz("blad");
    }
  });
}
