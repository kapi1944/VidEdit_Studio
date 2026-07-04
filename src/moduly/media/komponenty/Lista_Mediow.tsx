import type { PlikMediow } from "../../../domena/media/typyMediow";

type WlasciwosciListaMediow = {
  media: PlikMediow[];
};

function formatujStatusImportu(statusImportu: PlikMediow["statusImportu"]): string {
  if (statusImportu === "zaimportowany") {
    return "Zaimportowano";
  }

  return statusImportu;
}

function formatujCzasTrwania(czasTrwaniaMs: number): string {
  const laczneSekundy = Math.round(czasTrwaniaMs / 1000);
  const sekundy = laczneSekundy % 60;
  const laczneMinuty = Math.floor(laczneSekundy / 60);
  const minuty = laczneMinuty % 60;
  const godziny = Math.floor(laczneMinuty / 60);

  return `${String(godziny).padStart(2, "0")}:${String(minuty).padStart(
    2,
    "0"
  )}:${String(sekundy).padStart(2, "0")}`;
}

export function Lista_Mediow({ media }: WlasciwosciListaMediow) {
  return (
    <section className="lista-mediow" aria-labelledby="lista-mediow">
      <h2 id="lista-mediow">Media</h2>

      {media.length === 0 ? (
        <p className="lista-mediow__pusty">Brak zaimportowanych mediow.</p>
      ) : (
        <ul className="lista-mediow__lista">
          {media.map((plikMediow) => (
            <li className="lista-mediow__element" key={plikMediow.id}>
              <p className="lista-mediow__nazwa">{plikMediow.nazwaPliku}</p>
              <dl className="lista-mediow__dane">
                <div>
                  <dt>Typ</dt>
                  <dd>{plikMediow.typ}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{formatujStatusImportu(plikMediow.statusImportu)}</dd>
                </div>
                {plikMediow.czasTrwaniaMs !== undefined ? (
                  <div>
                    <dt>Czas trwania</dt>
                    <dd>{formatujCzasTrwania(plikMediow.czasTrwaniaMs)}</dd>
                  </div>
                ) : null}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
