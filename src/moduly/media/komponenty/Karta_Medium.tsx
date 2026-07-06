import { utworzDaneKartyMedium } from "../../../domena/media/formatowanieKartyMedium";
import type { PlikMediow } from "../../../domena/media/typyMediow";

export type WlasciwosciKartyMedium = {
  plikMediow: PlikMediow;
  miniaturaDataUrl?: string;
  status?: string;
  czyAktywne?: boolean;
  naWybierzDoPodgladu?: (idMedium: string) => void;
  naDodajNaTimeline?: (idMedium: string) => void;
};

const etykietyTypowMediow: Record<PlikMediow["typ"], string> = {
  wideo: "Wideo",
  audio: "Audio",
  grafika: "Grafika"
};

export function Karta_Medium({
  plikMediow,
  miniaturaDataUrl,
  status,
  czyAktywne = false,
  naWybierzDoPodgladu,
  naDodajNaTimeline
}: WlasciwosciKartyMedium) {
  const daneKarty = utworzDaneKartyMedium(plikMediow, status);
  const klasyKarty = [
    "karta-medium",
    `karta-medium--${plikMediow.typ}`,
    czyAktywne ? "karta-medium--aktywna" : undefined
  ]
    .filter(Boolean)
    .join(" ");

  function obsluzDodanieNaTimeline() {
    naDodajNaTimeline?.(plikMediow.id);
  }

  function obsluzWybranieDoPodgladu() {
    naWybierzDoPodgladu?.(plikMediow.id);
  }

  return (
    <article className={klasyKarty} aria-label={daneKarty.nazwaPliku}>
      <div className="karta-medium__miniatura">
        {miniaturaDataUrl ? (
          <img
            src={miniaturaDataUrl}
            alt={`Miniatura pliku ${daneKarty.nazwaPliku}`}
          />
        ) : (
          <div
            className="karta-medium__placeholder"
            role="img"
            aria-label="Miniatura niedostepna"
          >
            Brak miniatury
          </div>
        )}
        <span className="karta-medium__typ">
          {etykietyTypowMediow[plikMediow.typ]}
        </span>
      </div>

      <div className="karta-medium__opis">
        <p className="karta-medium__nazwa" title={daneKarty.nazwaPliku}>
          {daneKarty.nazwaPliku}
        </p>
        <div className="karta-medium__metki" aria-label="Metadane medium">
          <span>{daneKarty.czasTrwania}</span>
          <span>{daneKarty.rozdzielczosc}</span>
          <span>{daneKarty.status}</span>
        </div>
        {naDodajNaTimeline || naWybierzDoPodgladu ? (
          <div className="karta-medium__akcje">
            {naWybierzDoPodgladu ? (
              <button
                type="button"
                aria-pressed={czyAktywne}
                onClick={obsluzWybranieDoPodgladu}
              >
                Podglad
              </button>
            ) : null}
            {naDodajNaTimeline ? (
              <button
                type="button"
                title="Dodaj na os czasu"
                onClick={obsluzDodanieNaTimeline}
              >
                Na os
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}