import type { PlikMediow } from "../../../domena/media/typyMediow";
import { Karta_Medium } from "./Karta_Medium";
import type { PodgladyMediow } from "../typyPodgladuMediow";

type WlasciwosciListaMediow = {
  media: PlikMediow[];
  podgladyMediow: PodgladyMediow;
  naDodajNaTimeline?: (idMedium: string) => void;
};

export function Lista_Mediow({
  media,
  podgladyMediow,
  naDodajNaTimeline
}: WlasciwosciListaMediow) {
  return (
    <section className="lista-mediow" aria-labelledby="lista-mediow">
      <h2 id="lista-mediow">Media</h2>

      {media.length === 0 ? (
        <p className="lista-mediow__pusty">Brak zaimportowanych mediow.</p>
      ) : (
        <ul className="lista-mediow__lista">
          {media.map((plikMediow) => {
            const podgladMedium = podgladyMediow[plikMediow.id];

            return (
              <li className="lista-mediow__element" key={plikMediow.id}>
                <Karta_Medium
                  plikMediow={plikMediow}
                  miniaturaDataUrl={podgladMedium?.miniaturaDataUrl}
                  status={podgladMedium?.statusMiniatury}
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
