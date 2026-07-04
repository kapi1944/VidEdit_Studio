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

  if (godziny > 0) {
    return `${String(godziny).padStart(2, "0")}:${String(minuty).padStart(
      2,
      "0"
    )}:${String(sekundy).padStart(2, "0")}`;
  }

  return `${String(minuty).padStart(2, "0")}:${String(sekundy).padStart(
    2,
    "0"
  )}`;
}

function pobierzCzasTrwania(plikMediow: PlikMediow): number | undefined {
  return plikMediow.metadane?.czasTrwaniaMs ?? plikMediow.czasTrwaniaMs;
}

function pobierzRozdzielczosc(plikMediow: PlikMediow): string | undefined {
  const szerokosc =
    plikMediow.metadane?.szerokoscPx ?? plikMediow.szerokoscWideo;
  const wysokosc = plikMediow.metadane?.wysokoscPx ?? plikMediow.wysokoscWideo;

  if (szerokosc === undefined || wysokosc === undefined) {
    return undefined;
  }

  return `${szerokosc} × ${wysokosc}`;
}

function formatujStatusMetadanych(plikMediow: PlikMediow): string {
  if (!plikMediow.metadane) {
    return "brak";
  }

  return plikMediow.metadane.czyMetadanePelne ? "pełne" : "podstawowe";
}

export function Lista_Mediow({ media }: WlasciwosciListaMediow) {
  return (
    <section className="lista-mediow" aria-labelledby="lista-mediow">
      <h2 id="lista-mediow">Media</h2>

      {media.length === 0 ? (
        <p className="lista-mediow__pusty">Brak zaimportowanych mediow.</p>
      ) : (
        <ul className="lista-mediow__lista">
          {media.map((plikMediow) => {
            const czasTrwania = pobierzCzasTrwania(plikMediow);
            const rozdzielczosc = pobierzRozdzielczosc(plikMediow);

            return (
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
                  <div>
                    <dt>Czas</dt>
                    <dd>
                      {czasTrwania !== undefined
                        ? formatujCzasTrwania(czasTrwania)
                        : "brak"}
                    </dd>
                  </div>
                  <div>
                    <dt>Rozdzielczość</dt>
                    <dd>{rozdzielczosc ?? "brak"}</dd>
                  </div>
                  <div>
                    <dt>Metadane</dt>
                    <dd>{formatujStatusMetadanych(plikMediow)}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
