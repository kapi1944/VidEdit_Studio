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

export const domyslnyMotywInterfejsu: MotywInterfejsu = "black-red";
export const domyslnyTrybInterfejsu: TrybInterfejsu = "pro";

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
