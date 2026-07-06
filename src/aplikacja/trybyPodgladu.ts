export type TrybPodgladu = "klip" | "timeline" | "dzielony";

export const domyslnyTrybPodgladu: TrybPodgladu = "timeline";

export const etykietyTrybuPodgladu: Record<TrybPodgladu, string> = {
  klip: "Klip",
  timeline: "Timeline",
  dzielony: "Dzielony"
};

export function sprawdzCzyTrybPodgladuJestPoprawny(
  trybPodgladu: string
): trybPodgladu is TrybPodgladu {
  return (
    trybPodgladu === "klip" ||
    trybPodgladu === "timeline" ||
    trybPodgladu === "dzielony"
  );
}
