import type { MouseEvent as ZdarzenieMyszy } from "react";
import type {
  KlipTimeline,
  TrybEdycjiKlipuMysza
} from "../../../domena/timeline/typyTimeline";
import { przeliczZakresCzasuNaPolozenie } from "../przeliczCzasNaPozycje";

type WlasciwosciPaskaKlipu = {
  klipTimeline: KlipTimeline;
  czasTrwaniaTimelineMs: number;
  czyZaznaczony?: boolean;
  formatujCzas: (czasMs: number) => string;
  naZaznacz?: (idKlipu: string) => void;
  naRozpocznijEdycjeMysza?: (
    klipTimeline: KlipTimeline,
    trybEdycji: TrybEdycjiKlipuMysza,
    pozycjaMyszyX: number,
    szerokoscTimelinePx: number
  ) => void;
};

export function Pasek_Klipu({
  klipTimeline,
  czasTrwaniaTimelineMs,
  czyZaznaczony = false,
  formatujCzas,
  naZaznacz,
  naRozpocznijEdycjeMysza
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

  function pobierzSzerokoscTimeline(
    zdarzenie: ZdarzenieMyszy<HTMLButtonElement | HTMLSpanElement>
  ) {
    return (
      zdarzenie.currentTarget
        .closest(".panel-osi-czasu__klipy-sciezki")
        ?.getBoundingClientRect().width ?? 0
    );
  }

  function rozpocznijEdycjeMysza(
    zdarzenie: ZdarzenieMyszy<HTMLButtonElement | HTMLSpanElement>,
    trybEdycji: TrybEdycjiKlipuMysza
  ) {
    if (zdarzenie.button !== 0 || !naRozpocznijEdycjeMysza) {
      return;
    }

    zdarzenie.preventDefault();
    zdarzenie.stopPropagation();
    naZaznacz?.(klipTimeline.id);
    naRozpocznijEdycjeMysza(
      klipTimeline,
      trybEdycji,
      zdarzenie.clientX,
      pobierzSzerokoscTimeline(zdarzenie)
    );
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
      onMouseDown={(zdarzenie) =>
        rozpocznijEdycjeMysza(zdarzenie, "przesuwanie")
      }
      onClick={obsluzZaznaczenie}
    >
      <span
        className="pasek-klipu__uchwyt pasek-klipu__uchwyt--lewy"
        aria-hidden="true"
        onMouseDown={(zdarzenie) =>
          rozpocznijEdycjeMysza(zdarzenie, "trim-lewy")
        }
      />
      <span className="pasek-klipu__nazwa">{klipTimeline.nazwa}</span>
      <span className="pasek-klipu__czas">{etykietaCzasu}</span>
      <span
        className="pasek-klipu__uchwyt pasek-klipu__uchwyt--prawy"
        aria-hidden="true"
        onMouseDown={(zdarzenie) =>
          rozpocznijEdycjeMysza(zdarzenie, "trim-prawy")
        }
      />
    </button>
  );
}
