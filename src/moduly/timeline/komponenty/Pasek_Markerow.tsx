import type { MouseEvent as ZdarzenieMyszy } from "react";
import type { MarkerTimeline } from "../../../domena/timeline/typyTimeline";
import { przeliczCzasNaProcent } from "../przeliczCzasNaPozycje";

type WlasciwosciPaskaMarkerow = {
  markeryTimeline: MarkerTimeline[];
  czasTrwaniaTimelineMs: number;
  formatujCzas: (czasMs: number) => string;
  naUsunMarker: (idMarkera: string) => void;
};

export function Pasek_Markerow({
  markeryTimeline,
  czasTrwaniaTimelineMs,
  formatujCzas,
  naUsunMarker
}: WlasciwosciPaskaMarkerow) {
  function obsluzDwuklikMarkera(
    zdarzenie: ZdarzenieMyszy<HTMLButtonElement>,
    idMarkera: string
  ) {
    zdarzenie.stopPropagation();
    naUsunMarker(idMarkera);
  }

  function zatrzymajKlikMarkera(zdarzenie: ZdarzenieMyszy<HTMLButtonElement>) {
    zdarzenie.stopPropagation();
  }

  return (
    <>
      {markeryTimeline.map((markerTimeline) => {
        const polozenieProcent = przeliczCzasNaProcent(
          markerTimeline.czasMs,
          czasTrwaniaTimelineMs
        );

        return (
          <button
            key={markerTimeline.id}
            type="button"
            className="marker-timeline"
            style={{ left: `${polozenieProcent}%` }}
            aria-label={`Marker ${formatujCzas(markerTimeline.czasMs)}`}
            title={`Marker ${formatujCzas(markerTimeline.czasMs)}`}
            onMouseDown={zatrzymajKlikMarkera}
            onDoubleClick={(zdarzenie) =>
              obsluzDwuklikMarkera(zdarzenie, markerTimeline.id)
            }
          />
        );
      })}
    </>
  );
}
