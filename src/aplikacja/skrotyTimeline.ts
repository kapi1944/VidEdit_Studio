type DaneZdarzeniaKlawisza = Pick<
  KeyboardEvent,
  "altKey" | "ctrlKey" | "key" | "metaKey"
>;

const tagiBlokujaceSkrotyTimeline = ["input", "textarea", "select"];

export function czySkrotyTimelineDozwolone(
  aktywnyElement: Element | null
): boolean {
  if (!aktywnyElement) {
    return true;
  }

  const nazwaTagu = aktywnyElement.tagName.toLowerCase();

  if (tagiBlokujaceSkrotyTimeline.includes(nazwaTagu)) {
    return false;
  }

  if (aktywnyElement.closest("[contenteditable='true']")) {
    return false;
  }

  return true;
}

export function czySkrotCieciaTimeline(
  zdarzenie: DaneZdarzeniaKlawisza
): boolean {
  return (
    zdarzenie.key.toLowerCase() === "s" &&
    !zdarzenie.altKey &&
    !zdarzenie.ctrlKey &&
    !zdarzenie.metaKey
  );
}
