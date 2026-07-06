import type { BladWalidacji } from "../../wspolne/bledy";
import type {
  PresetWykrywaniaCiszy,
  UstawieniaWykrywaniaCiszy
} from "./typyCiszy";

export const DOMYSLNE_USTAWIENIA_WYKRYWANIA_CISZY: UstawieniaWykrywaniaCiszy =
  {
    progCiszyDb: -45,
    minimalnaDlugoscCiszyMs: 500,
    marginesPrzedMs: 80,
    marginesPoMs: 120,
    minimalnaPrzerwaMiedzySegmentamiMs: 200
  };

export const ZAKRESY_USTAWIEN_WYKRYWANIA_CISZY = {
  progCiszyDb: { minimum: -80, maksimum: -10, jednostka: "dB" },
  minimalnaDlugoscCiszyMs: { minimum: 100, maksimum: 10000, jednostka: "ms" },
  marginesPrzedMs: { minimum: 0, maksimum: 2000, jednostka: "ms" },
  marginesPoMs: { minimum: 0, maksimum: 2000, jednostka: "ms" },
  minimalnaPrzerwaMiedzySegmentamiMs: {
    minimum: 0,
    maksimum: 10000,
    jednostka: "ms"
  }
} as const;

export const listaPresetowWykrywaniaCiszy: Array<{
  id: PresetWykrywaniaCiszy;
  etykieta: string;
  opis: string;
  ustawienia: UstawieniaWykrywaniaCiszy;
}> = [
  {
    id: "delikatny",
    etykieta: "Delikatny",
    opis: "Mniej czuly, zostawia wiecej naturalnych pauz.",
    ustawienia: {
      progCiszyDb: -50,
      minimalnaDlugoscCiszyMs: 700,
      marginesPrzedMs: 120,
      marginesPoMs: 160,
      minimalnaPrzerwaMiedzySegmentamiMs: 300
    }
  },
  {
    id: "normalny",
    etykieta: "Normalny",
    opis: "Zbalansowane ustawienia do typowej mowy.",
    ustawienia: DOMYSLNE_USTAWIENIA_WYKRYWANIA_CISZY
  },
  {
    id: "agresywny",
    etykieta: "Agresywny",
    opis: "Bardziej czuly, szuka krotszych i cichszych przerw.",
    ustawienia: {
      progCiszyDb: -35,
      minimalnaDlugoscCiszyMs: 300,
      marginesPrzedMs: 40,
      marginesPoMs: 60,
      minimalnaPrzerwaMiedzySegmentamiMs: 100
    }
  }
];

export function pobierzPresetWykrywaniaCiszy(
  preset: PresetWykrywaniaCiszy
): UstawieniaWykrywaniaCiszy {
  const znalezionyPreset = listaPresetowWykrywaniaCiszy.find(
    (pozycjaPresetu) => pozycjaPresetu.id === preset
  );

  return {
    ...(znalezionyPreset?.ustawienia ??
      DOMYSLNE_USTAWIENIA_WYKRYWANIA_CISZY)
  };
}

function dodajBladZakresu(
  bledy: BladWalidacji[],
  pole: keyof UstawieniaWykrywaniaCiszy,
  wartosc: number
) {
  const zakres = ZAKRESY_USTAWIEN_WYKRYWANIA_CISZY[pole];

  if (wartosc < zakres.minimum || wartosc > zakres.maksimum) {
    bledy.push({
      pole,
      komunikat: `${pole} musi byc w zakresie od ${zakres.minimum} do ${zakres.maksimum} ${zakres.jednostka}.`
    });
  }
}

export function walidujUstawieniaWykrywaniaCiszy(
  ustawienia: UstawieniaWykrywaniaCiszy,
  czasTrwaniaAudioMs = 1
): BladWalidacji[] {
  const bledy: BladWalidacji[] = [];

  if (!Number.isFinite(ustawienia.progCiszyDb)) {
    bledy.push({
      pole: "progCiszyDb",
      komunikat: "Prog ciszy musi byc liczba skonczona."
    });
  } else {
    dodajBladZakresu(bledy, "progCiszyDb", ustawienia.progCiszyDb);
  }

  if (
    !Number.isFinite(ustawienia.minimalnaDlugoscCiszyMs) ||
    ustawienia.minimalnaDlugoscCiszyMs <= 0
  ) {
    bledy.push({
      pole: "minimalnaDlugoscCiszyMs",
      komunikat: "Minimalna dlugosc ciszy musi byc wieksza od zera."
    });
  } else {
    dodajBladZakresu(
      bledy,
      "minimalnaDlugoscCiszyMs",
      ustawienia.minimalnaDlugoscCiszyMs
    );
  }

  if (
    !Number.isFinite(ustawienia.marginesPrzedMs) ||
    ustawienia.marginesPrzedMs < 0
  ) {
    bledy.push({
      pole: "marginesPrzedMs",
      komunikat: "Margines przed cisza nie moze byc ujemny."
    });
  } else {
    dodajBladZakresu(bledy, "marginesPrzedMs", ustawienia.marginesPrzedMs);
  }

  if (
    !Number.isFinite(ustawienia.marginesPoMs) ||
    ustawienia.marginesPoMs < 0
  ) {
    bledy.push({
      pole: "marginesPoMs",
      komunikat: "Margines po ciszy nie moze byc ujemny."
    });
  } else {
    dodajBladZakresu(bledy, "marginesPoMs", ustawienia.marginesPoMs);
  }

  if (
    !Number.isFinite(ustawienia.minimalnaPrzerwaMiedzySegmentamiMs) ||
    ustawienia.minimalnaPrzerwaMiedzySegmentamiMs < 0
  ) {
    bledy.push({
      pole: "minimalnaPrzerwaMiedzySegmentamiMs",
      komunikat: "Minimalna przerwa miedzy segmentami nie moze byc ujemna."
    });
  } else {
    dodajBladZakresu(
      bledy,
      "minimalnaPrzerwaMiedzySegmentamiMs",
      ustawienia.minimalnaPrzerwaMiedzySegmentamiMs
    );
  }

  if (!Number.isFinite(czasTrwaniaAudioMs) || czasTrwaniaAudioMs <= 0) {
    bledy.push({
      pole: "czasTrwaniaAudioMs",
      komunikat: "Czas trwania audio musi byc wiekszy od zera."
    });
  }

  return bledy;
}

export function rzucJesliNiepoprawneUstawieniaWykrywaniaCiszy(
  ustawienia: UstawieniaWykrywaniaCiszy,
  czasTrwaniaAudioMs: number
): void {
  const bledy = walidujUstawieniaWykrywaniaCiszy(
    ustawienia,
    czasTrwaniaAudioMs
  );

  if (bledy.length > 0) {
    throw new Error(bledy.map((blad) => blad.komunikat).join(" "));
  }
}
