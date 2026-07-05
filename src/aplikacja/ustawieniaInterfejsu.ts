export type MotywInterfejsu =
  | "black-red"
  | "sharp"
  | "soft"
  | "neon"
  | "flame"
  | "glass";

export const domyslnyMotywInterfejsu: MotywInterfejsu = "black-red";

export const etykietyMotywuInterfejsu: Record<MotywInterfejsu, string> = {
  "black-red": "Black&Red",
  sharp: "Sharp",
  soft: "Soft",
  neon: "Neon",
  flame: "Flame",
  glass: "Glass"
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
