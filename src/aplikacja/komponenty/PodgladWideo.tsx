import { useEffect, type RefObject, type SyntheticEvent } from "react";

type WlasciwosciPodgladuWideo = {
  objectUrl: string;
  nazwaKlipu?: string;
  nazwaPliku: string;
  etykietaAktywnegoKlipu?: string;
  czasAktualnyMs: number;
  czasTrwaniaMs?: number;
  uchwytWideoRef: RefObject<HTMLVideoElement | null>;
  czyPrzeciaganieGlowicy: boolean;
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
  nazwaKlipu,
  nazwaPliku,
  etykietaAktywnegoKlipu,
  czasAktualnyMs,
  czasTrwaniaMs,
  uchwytWideoRef,
  czyPrzeciaganieGlowicy,
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

  useEffect(() => {
    const elementWideo = uchwytWideoRef.current;

    if (!elementWideo || !Number.isFinite(czasAktualnyMs)) {
      return;
    }

    const czasSekundy = czasAktualnyMs / 1000;

    if (Math.abs(elementWideo.currentTime - czasSekundy) > 0.05) {
      elementWideo.currentTime = czasSekundy;
    }
  }, [czasAktualnyMs, uchwytWideoRef]);

  function obsluzZmianeCzasuOdtwarzania(
    zdarzenie: SyntheticEvent<HTMLVideoElement>
  ) {
    if (czyPrzeciaganieGlowicy) {
      return;
    }

    naZmianeCzasuOdtwarzania(zdarzenie.currentTarget.currentTime * 1000);
  }

  return (
    <div className="podglad-wideo">
      <div className="podglad-wideo__naglowek">
        <div className="podglad-wideo__opis">
          {etykietaAktywnegoKlipu ? (
            <span className="podglad-wideo__etykieta">
              {etykietaAktywnegoKlipu}
            </span>
          ) : null}
          <p className="podglad-wideo__nazwa">{nazwaKlipu ?? nazwaPliku}</p>
          {nazwaKlipu ? (
            <p className="podglad-wideo__zrodlo">Zrodlo: {nazwaPliku}</p>
          ) : null}
        </div>
        <p className="podglad-wideo__czas">{tekstCzasu}</p>
      </div>

      <div className="podglad-wideo__ramka">
        <video
          controls
          ref={uchwytWideoRef}
          src={objectUrl}
          aria-label={`Podgląd wideo ${nazwaPliku}`}
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
