import type { PropozycjaCiecia } from "../../../domena/timeline/typyTimeline";

type WlasciwosciPaneluPropozycjiCiec = {
  propozycjeCiec: PropozycjaCiecia[];
  formatujCzasCiecia: (czasMs: number) => string;
  naZatwierdz: (idPropozycjiCiecia: string) => void;
  naOdrzuc: (idPropozycjiCiecia: string) => void;
  naCofnijDecyzje: (idPropozycjiCiecia: string) => void;
  naZatwierdzWszystkie: () => void;
};

function pobierzEtykieteStatusu(propozycja: PropozycjaCiecia): string {
  if (propozycja.status === "zatwierdzona") {
    return "Zatwierdzone";
  }

  if (propozycja.status === "odrzucona") {
    return "Odrzucone";
  }

  return "Oczekuje";
}

export function Panel_Propozycji_Ciec({
  propozycjeCiec,
  formatujCzasCiecia,
  naZatwierdz,
  naOdrzuc,
  naCofnijDecyzje,
  naZatwierdzWszystkie
}: WlasciwosciPaneluPropozycjiCiec) {
  const czySaOczekujacePropozycje = propozycjeCiec.some(
    (propozycja) => propozycja.status === "oczekuje"
  );

  return (
    <section
      className="panel-propozycji-ciec"
      aria-labelledby="propozycje-ciec-tytul"
    >
      <div className="panel-propozycji-ciec__naglowek">
        <div>
          <p className="panel-propozycji-ciec__etykieta">Decyzje użytkownika</p>
          <h2 id="propozycje-ciec-tytul">Propozycje cięć</h2>
        </div>
        <button
          className="panel-propozycji-ciec__przycisk"
          type="button"
          disabled={!czySaOczekujacePropozycje}
          onClick={naZatwierdzWszystkie}
        >
          Zatwierdź wszystkie
        </button>
      </div>

      {propozycjeCiec.length === 0 ? (
        <p className="panel-propozycji-ciec__pusty">
          Brak propozycji cięć z wykrytej ciszy.
        </p>
      ) : (
        <ul className="panel-propozycji-ciec__lista">
          {propozycjeCiec.map((propozycja) => (
            <li className="panel-propozycji-ciec__element" key={propozycja.id}>
              <div className="panel-propozycji-ciec__dane">
                <span className="panel-propozycji-ciec__czas">
                  {formatujCzasCiecia(propozycja.czasPoczatkuMs)} -{" "}
                  {formatujCzasCiecia(propozycja.czasKoncaMs)}
                </span>
                <span
                  className={`panel-propozycji-ciec__status panel-propozycji-ciec__status--${propozycja.status}`}
                >
                  {pobierzEtykieteStatusu(propozycja)}
                </span>
              </div>

              <div className="panel-propozycji-ciec__akcje">
                <button
                  className="panel-propozycji-ciec__przycisk"
                  type="button"
                  disabled={propozycja.status === "zatwierdzona"}
                  onClick={() => naZatwierdz(propozycja.id)}
                >
                  Zatwierdź
                </button>
                <button
                  className="panel-propozycji-ciec__przycisk panel-propozycji-ciec__przycisk--drugorzedny"
                  type="button"
                  disabled={propozycja.status === "odrzucona"}
                  onClick={() => naOdrzuc(propozycja.id)}
                >
                  Odrzuć
                </button>
                <button
                  className="panel-propozycji-ciec__przycisk panel-propozycji-ciec__przycisk--drugorzedny"
                  type="button"
                  disabled={propozycja.status === "oczekuje"}
                  onClick={() => naCofnijDecyzje(propozycja.id)}
                >
                  Cofnij decyzję
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
