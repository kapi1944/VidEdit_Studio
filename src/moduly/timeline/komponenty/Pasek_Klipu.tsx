import type { MouseEvent as ZdarzenieMyszy } from "react";
import type { KlipTimeline } from "../../../domena/timeline/typyTimeline";
import { przeliczZakresCzasuNaPolozenie } from "../przeliczCzasNaPozycje";

type WlasciwosciPaskaKlipu = {
  klipTimeline: KlipTimeline;
  czasTrwaniaTimelineMs: number;
  czyZaznaczony?: boolean;
  formatujCzas: (czasMs: number) => string;
  naZaznacz?: (idKlipu: string) => void;
};

export function Pasek_Klipu({
  klipTimeline,
  czasTrwaniaTimelineMs,
  czyZaznaczony = false,
  formatujCzas,
  naZaznacz
}: WlasciwosciPaskaKlipu) {
  const { polozenieOdLewejProcent, szerokoscProcent } =
    przeliczZakresCzasuNaPolozenie(
      klipTimeline.czasStartuMs,
      klipTimeline.czasStartuMs + klipTimeline.czasTrwaniaMs,
      czasTrwaniaTimelineMs
    );
  const etykietaCzasu =
    klipTimeline.czasTrwaniaMs > 0
      ? formatujCzas(klipTimeline.czasTrwaniaMs)
      : "brak czasu";

  function obsluzZaznaczenie(zdarzenie: ZdarzenieMyszy<HTMLButtonElement>) {
    zdarzenie.stopPropagation();
    naZaznacz?.(klipTimeline.id);
  }

  return (
    <button
      type="button"
      className={`pasek-klipu${czyZaznaczony ? " pasek-klipu--zaznaczony" : ""}`}
      style={{
        left: `${polozenieOdLewejProcent}%`,
        width: `${szerokoscProcent}%`
      }}
      aria-label={`Klip ${klipTimeline.nazwa}, dlugosc ${etykietaCzasu}`}
      aria-pressed={czyZaznaczony}
      onClick={obsluzZaznaczenie}
    >
      <span className="pasek-klipu__nazwa">{klipTimeline.nazwa}</span>
      <span className="pasek-klipu__czas">{etykietaCzasu}</span>
    </button>
  );
}
