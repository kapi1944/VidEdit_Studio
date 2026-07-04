import { utworzDaneKartyMedium } from "../../../domena/media/formatowanieKartyMedium";
import type { PlikMediow } from "../../../domena/media/typyMediow";

export type WlasciwosciKartyMedium = {
  plikMediow: PlikMediow;
  miniaturaDataUrl?: string;
  status?: string;
};

export function Karta_Medium({
  plikMediow,
  miniaturaDataUrl,
  status
}: WlasciwosciKartyMedium) {
  const daneKarty = utworzDaneKartyMedium(plikMediow, status);

  return (
    <article className="karta-medium" aria-label={daneKarty.nazwaPliku}>
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
      </div>

      <div>
        <p className="karta-medium__nazwa">{daneKarty.nazwaPliku}</p>
        <dl className="karta-medium__metadane">
          <div>
            <dt>Typ pliku</dt>
            <dd>{daneKarty.typPliku}</dd>
          </div>
          <div>
            <dt>Czas</dt>
            <dd>{daneKarty.czasTrwania}</dd>
          </div>
          <div>
            <dt>Rozdzielczosc</dt>
            <dd>{daneKarty.rozdzielczosc}</dd>
          </div>
          <div>
            <dt>FPS</dt>
            <dd>{daneKarty.fps}</dd>
          </div>
          <div>
            <dt>Audio</dt>
            <dd>{daneKarty.audio}</dd>
          </div>
        </dl>
        <p className="karta-medium__status">Status: {daneKarty.status}</p>
      </div>
    </article>
  );
}
