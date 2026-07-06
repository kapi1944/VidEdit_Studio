export type MotywInterfejsu =
  | "black-red"
  | "sharp"
  | "soft"
  | "neon"
  | "flame"
  | "glass";

export type TrybInterfejsu = "lite" | "pro";

export type WidocznoscFunkcji = {
  pokazZaawansowaneUstawieniaTimeline: boolean;
  pokazPanelSzybkichAkcji: boolean;
  pokazPelnyInspektor: boolean;
  pokazZaawansowaneParametryEksportu: boolean;
};

export type RozmiaryLayoutu = {
  szerokoscPaneluLewegoPx: number;
  szerokoscPaneluPrawegoPx: number;
  wysokoscTimelinePx: number;
};

export const domyslnyMotywInterfejsu: MotywInterfejsu = "black-red";
export const domyslnyTrybInterfejsu: TrybInterfejsu = "pro";
export const domyslneRozmiaryLayoutu: RozmiaryLayoutu = {
  szerokoscPaneluLewegoPx: 280,
  szerokoscPaneluPrawegoPx: 420,
  wysokoscTimelinePx: 220
};

const ograniczeniaRozmiarowLayoutu = {
  panelLewy: {
    minimumPx: 220,
    maksimumPx: 420
  },
  panelPrawy: {
    minimumPx: 300,
    maksimumPx: 560
  },
  timeline: {
    minimumPx: 180,
    maksimumPx: 360
  }
};

export const etykietyMotywuInterfejsu: Record<MotywInterfejsu, string> = {
  "black-red": "Black&Red",
  sharp: "Sharp",
  soft: "Soft",
  neon: "Neon",
  flame: "Flame",
  glass: "Glass"
};

export const etykietyTrybuInterfejsu: Record<TrybInterfejsu, string> = {
  lite: "Tryb LITE",
  pro: "Tryb PRO"
};

export function sprawdzCzyMotywInterfejsuJestPoprawny(
  motywInterfejsu: string | null
): motywInterfejsu is MotywInterfejsu {
  return (
    motywInterfejsu === "black-red" ||
    motywInterfejsu === "sharp" ||
    motywInterfejsu === "soft" ||
    motywInterfejsu === "neon" ||
    motywInterfejsu === "flame" ||
    motywInterfejsu === "glass"
  );
}

export function sprawdzCzyTrybInterfejsuJestPoprawny(
  trybInterfejsu: string | null
): trybInterfejsu is TrybInterfejsu {
  return trybInterfejsu === "lite" || trybInterfejsu === "pro";
}

export function czyTrybLite(trybInterfejsu: TrybInterfejsu) {
  return trybInterfejsu === "lite";
}

export function czyTrybPro(trybInterfejsu: TrybInterfejsu) {
  return trybInterfejsu === "pro";
}

export function pobierzWidocznoscFunkcjiDlaTrybu(
  trybInterfejsu: TrybInterfejsu
): WidocznoscFunkcji {
  if (czyTrybLite(trybInterfejsu)) {
    return {
      pokazZaawansowaneUstawieniaTimeline: false,
      pokazPanelSzybkichAkcji: true,
      pokazPelnyInspektor: false,
      pokazZaawansowaneParametryEksportu: false
    };
  }

  return {
    pokazZaawansowaneUstawieniaTimeline: true,
    pokazPanelSzybkichAkcji: false,
    pokazPelnyInspektor: true,
    pokazZaawansowaneParametryEksportu: true
  };
}

function ograniczLiczbeDoZakresu(
  wartosc: number,
  minimum: number,
  maksimum: number
) {
  return Math.min(Math.max(wartosc, minimum), maksimum);
}

export function ograniczSzerokoscPaneluLewego(szerokoscPx: number) {
  return ograniczLiczbeDoZakresu(
    szerokoscPx,
    ograniczeniaRozmiarowLayoutu.panelLewy.minimumPx,
    ograniczeniaRozmiarowLayoutu.panelLewy.maksimumPx
  );
}

export function ograniczSzerokoscPaneluPrawego(szerokoscPx: number) {
  return ograniczLiczbeDoZakresu(
    szerokoscPx,
    ograniczeniaRozmiarowLayoutu.panelPrawy.minimumPx,
    ograniczeniaRozmiarowLayoutu.panelPrawy.maksimumPx
  );
}

export function ograniczWysokoscTimeline(wysokoscPx: number) {
  return ograniczLiczbeDoZakresu(
    wysokoscPx,
    ograniczeniaRozmiarowLayoutu.timeline.minimumPx,
    ograniczeniaRozmiarowLayoutu.timeline.maksimumPx
  );
}

export function pobierzOgraniczoneRozmiaryLayoutu(
  rozmiaryLayoutu: Partial<RozmiaryLayoutu>
): RozmiaryLayoutu {
  return {
    szerokoscPaneluLewegoPx: ograniczSzerokoscPaneluLewego(
      rozmiaryLayoutu.szerokoscPaneluLewegoPx ??
        domyslneRozmiaryLayoutu.szerokoscPaneluLewegoPx
    ),
    szerokoscPaneluPrawegoPx: ograniczSzerokoscPaneluPrawego(
      rozmiaryLayoutu.szerokoscPaneluPrawegoPx ??
        domyslneRozmiaryLayoutu.szerokoscPaneluPrawegoPx
    ),
    wysokoscTimelinePx: ograniczWysokoscTimeline(
      rozmiaryLayoutu.wysokoscTimelinePx ??
        domyslneRozmiaryLayoutu.wysokoscTimelinePx
    )
  };
}
