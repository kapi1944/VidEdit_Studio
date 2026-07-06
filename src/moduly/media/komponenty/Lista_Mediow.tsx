import { useState } from "react";
import type { PlikMediow } from "../../../domena/media/typyMediow";
import { Karta_Medium } from "./Karta_Medium";
import type { PodgladyMediow } from "../typyPodgladuMediow";

type WlasciwosciListaMediow = {
  media: PlikMediow[];
  podgladyMediow: PodgladyMediow;
  idAktywnegoMedium?: string;
  naWybierzDoPodgladu?: (idMedium: string) => void;
  naDodajNaTimeline?: (idMedium: string) => void;
};

type FiltrMediow = "wszystkie" | "wideo" | "grafiki";

const etykietyFiltrowMediow: Record<FiltrMediow, string> = {
  wszystkie: "Wszystkie",
  wideo: "Wideo",
  grafiki: "Grafiki"
};

function czyMediumPasujeDoFiltra(plikMediow: PlikMediow, filtr: FiltrMediow) {
  if (filtr === "wideo") {
    return plikMediow.typ === "wideo";
  }

  if (filtr === "grafiki") {
    return plikMediow.typ === "grafika";
  }

  return true;
}

export function Lista_Mediow({
  media,
  podgladyMediow,
  idAktywnegoMedium,
  naWybierzDoPodgladu,
  naDodajNaTimeline
}: WlasciwosciListaMediow) {
  const [aktywnyFiltr, ustawAktywnyFiltr] =
    useState<FiltrMediow>("wszystkie");
  const mediaPoFiltrowaniu = media.filter((plikMediow) =>
    czyMediumPasujeDoFiltra(plikMediow, aktywnyFiltr)
  );

  return (
    <section className="lista-mediow" aria-labelledby="lista-mediow">
      <div className="lista-mediow__naglowek">
        <div>
          <h2 id="lista-mediow">Media</h2>
          <p className="lista-mediow__licznik">{media.length} plikow</p>
        </div>
        <div className="lista-mediow__filtry" aria-label="Filtr mediow">
          {(Object.keys(etykietyFiltrowMediow) as FiltrMediow[]).map(
            (filtr) => (
              <button
                type="button"
                key={filtr}
                aria-pressed={filtr === aktywnyFiltr}
                onClick={() => ustawAktywnyFiltr(filtr)}
              >
                {etykietyFiltrowMediow[filtr]}
              </button>
            )
          )}
        </div>
      </div>

      {media.length === 0 ? (
        <p className="lista-mediow__pusty">Brak zaimportowanych mediow.</p>
      ) : mediaPoFiltrowaniu.length === 0 ? (
        <p className="lista-mediow__pusty">Brak mediow w tym filtrze.</p>
      ) : (
        <ul className="lista-mediow__siatka">
          {mediaPoFiltrowaniu.map((plikMediow) => {
            const podgladMedium = podgladyMediow[plikMediow.id];

            return (
              <li className="lista-mediow__element" key={plikMediow.id}>
                <Karta_Medium
                  plikMediow={plikMediow}
                  miniaturaDataUrl={podgladMedium?.miniaturaDataUrl}
                  status={podgladMedium?.statusMiniatury}
                  czyAktywne={plikMediow.id === idAktywnegoMedium}
                  naWybierzDoPodgladu={naWybierzDoPodgladu}
                  naDodajNaTimeline={naDodajNaTimeline}
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}