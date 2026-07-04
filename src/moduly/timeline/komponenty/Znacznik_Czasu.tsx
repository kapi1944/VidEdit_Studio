import {
  useEffect,
  useRef,
  type MouseEvent as ZdarzenieMyszy,
  type RefObject
} from "react";
import { przeliczCzasNaProcent } from "../przeliczCzasNaPozycje";

type WlasciwosciZnacznikaCzasu = {
  czasAktualnyMs: number;
  czasTrwaniaMs: number;
  uchwytWideoRef: RefObject<HTMLVideoElement | null>;
  czyPrzeciaganieGlowicy: boolean;
  formatujCzas: (czasMs: number) => string;
  naRozpocznijPrzeciaganie: (
    zdarzenie: ZdarzenieMyszy<HTMLButtonElement>
  ) => void;
};

export function Znacznik_Czasu({
  czasAktualnyMs,
  czasTrwaniaMs,
  uchwytWideoRef,
  czyPrzeciaganieGlowicy,
  formatujCzas,
  naRozpocznijPrzeciaganie
}: WlasciwosciZnacznikaCzasu) {
  const uchwytZnacznikaRef = useRef<HTMLButtonElement>(null);
  const polozenieProcent = przeliczCzasNaProcent(
    czasAktualnyMs,
    czasTrwaniaMs
  );

  function ustawPolozenieZnacznika(czasMs: number) {
    const znacznik = uchwytZnacznikaRef.current;

    if (!znacznik) {
      return;
    }

    znacznik.style.left = `${przeliczCzasNaProcent(
      czasMs,
      czasTrwaniaMs
    )}%`;
  }

  useEffect(() => {
    ustawPolozenieZnacznika(czasAktualnyMs);
  }, [czasAktualnyMs, czasTrwaniaMs]);

  useEffect(() => {
    const elementWideo = uchwytWideoRef.current;

    if (!elementWideo) {
      return;
    }

    const aktywneWideo = elementWideo;
    let idKlatkiAnimacji: number | undefined;

    function zatrzymajPetleAnimacji() {
      if (idKlatkiAnimacji !== undefined) {
        cancelAnimationFrame(idKlatkiAnimacji);
        idKlatkiAnimacji = undefined;
      }
    }

    function odswiezPolozenieZCzasuWideo() {
      if (!czyPrzeciaganieGlowicy) {
        ustawPolozenieZnacznika(aktywneWideo.currentTime * 1000);
      }

      if (!aktywneWideo.paused && !aktywneWideo.ended) {
        idKlatkiAnimacji = requestAnimationFrame(odswiezPolozenieZCzasuWideo);
      } else {
        idKlatkiAnimacji = undefined;
      }
    }

    function uruchomPetleAnimacji() {
      zatrzymajPetleAnimacji();

      if (!aktywneWideo.paused && !aktywneWideo.ended) {
        idKlatkiAnimacji = requestAnimationFrame(odswiezPolozenieZCzasuWideo);
      }
    }

    aktywneWideo.addEventListener("play", uruchomPetleAnimacji);
    aktywneWideo.addEventListener("pause", zatrzymajPetleAnimacji);
    aktywneWideo.addEventListener("ended", zatrzymajPetleAnimacji);
    uruchomPetleAnimacji();

    return () => {
      aktywneWideo.removeEventListener("play", uruchomPetleAnimacji);
      aktywneWideo.removeEventListener("pause", zatrzymajPetleAnimacji);
      aktywneWideo.removeEventListener("ended", zatrzymajPetleAnimacji);
      zatrzymajPetleAnimacji();
    };
  }, [uchwytWideoRef, czasTrwaniaMs, czyPrzeciaganieGlowicy]);

  return (
    <button
      type="button"
      ref={uchwytZnacznikaRef}
      className="znacznik-czasu"
      style={{ left: `${polozenieProcent}%` }}
      aria-label={`Aktualny czas ${formatujCzas(czasAktualnyMs)}`}
      onMouseDown={naRozpocznijPrzeciaganie}
    />
  );
}
