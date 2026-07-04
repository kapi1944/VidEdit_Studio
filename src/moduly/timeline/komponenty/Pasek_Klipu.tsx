import type { KlipTimeline } from "../../../domena/timeline/typyTimeline";
import { przeliczZakresCzasuNaPolozenie } from "../przeliczCzasNaPozycje";

type WlasciwosciPaskaKlipu = {
  klipTimeline: KlipTimeline;
  czasTrwaniaTimelineMs: number;
  formatujCzas: (czasMs: number) => string;
};

export function Pasek_Klipu({
  klipTimeline,
  czasTrwaniaTimelineMs,
  formatujCzas
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

  return (
    <div
      className="pasek-klipu"
      style={{
        left: `${polozenieOdLewejProcent}%`,
        width: `${szerokoscProcent}%`
      }}
      aria-label={`Klip ${klipTimeline.nazwa}, dlugosc ${etykietaCzasu}`}
    >
      <span className="pasek-klipu__nazwa">{klipTimeline.nazwa}</span>
      <span className="pasek-klipu__czas">{etykietaCzasu}</span>
    </div>
  );
}
