import type { DaneInspektoraKlipu } from "../inspektorKlipu";

type WlasciwosciInspektoraKlipu = {
  daneInspektoraKlipu?: DaneInspektoraKlipu;
};

export function Inspektor_Klipu({
  daneInspektoraKlipu
}: WlasciwosciInspektoraKlipu) {
  return (
    <section className="inspektor-klipu" aria-labelledby="inspektor-klipu-tytul">
      <div className="inspektor-klipu__naglowek">
        <p className="inspektor-klipu__etykieta">Timeline</p>
        <h2 id="inspektor-klipu-tytul">Inspektor klipu</h2>
      </div>

      {!daneInspektoraKlipu ? (
        <p className="inspektor-klipu__pusty">
          Zaznacz klip na osi czasu, aby zobaczyć szczegóły.
        </p>
      ) : (
        <dl className="inspektor-klipu__lista">
          {daneInspektoraKlipu.wiersze.map((wiersz) => (
            <div className="inspektor-klipu__wiersz" key={wiersz.etykieta}>
              <dt>{wiersz.etykieta}</dt>
              <dd>{wiersz.wartosc}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
