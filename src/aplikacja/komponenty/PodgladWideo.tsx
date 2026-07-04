import type { SyntheticEvent } from "react";

type WlasciwosciPodgladuWideo = {
  objectUrl: string;
  nazwaPliku: string;
  czasAktualnyMs: number;
  czasTrwaniaMs?: number;
  rozdzielczosc?: string;
  fps?: string;
  audio?: string;
  formatujCzasPodgladu: (czasMs: number) => string;
  naZmianeCzasuOdtwarzania: (czasMs: number) => void;
};

export function utworzTekstCzasuPodgladu(
  czasAktualnyMs: number,
  czasTrwaniaMs: number | undefined,
  formatujCzasPodgladu: (czasMs: number) => string
) {
  const czasCalkowity =
    czasTrwaniaMs !== undefined && czasTrwaniaMs > 0
      ? formatujCzasPodgladu(czasTrwaniaMs)
      : "brak czasu";

  return `${formatujCzasPodgladu(czasAktualnyMs)} / ${czasCalkowity}`;
}

export function PodgladWideo({
  objectUrl,
  nazwaPliku,
  czasAktualnyMs,
  czasTrwaniaMs,
  rozdzielczosc,
  fps,
  audio,
  formatujCzasPodgladu,
  naZmianeCzasuOdtwarzania
}: WlasciwosciPodgladuWideo) {
  const tekstCzasu = utworzTekstCzasuPodgladu(
    czasAktualnyMs,
    czasTrwaniaMs,
    formatujCzasPodgladu
  );

  function obsluzZmianeCzasuOdtwarzania(
    zdarzenie: SyntheticEvent<HTMLVideoElement>
  ) {
    naZmianeCzasuOdtwarzania(
      Math.round(zdarzenie.currentTarget.currentTime * 1000)
    );
  }

  return (
    <div className="podglad-wideo">
      <div className="podglad-wideo__naglowek">
        <p className="podglad-wideo__nazwa">{nazwaPliku}</p>
        <p className="podglad-wideo__czas">{tekstCzasu}</p>
      </div>

      <div className="podglad-wideo__ramka">
        <video
          controls
          src={objectUrl}
          aria-label={`Podgląd filmu ${nazwaPliku}`}
          onTimeUpdate={obsluzZmianeCzasuOdtwarzania}
        />
      </div>

      <dl className="podglad-wideo__metadane" aria-label="Metadane podglądu">
        {rozdzielczosc ? (
          <div>
            <dt>Rozdzielczość</dt>
            <dd>{rozdzielczosc}</dd>
          </div>
        ) : null}
        {fps ? (
          <div>
            <dt>FPS</dt>
            <dd>{fps}</dd>
          </div>
        ) : null}
        {audio ? (
          <div>
            <dt>Audio</dt>
            <dd>{audio}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
