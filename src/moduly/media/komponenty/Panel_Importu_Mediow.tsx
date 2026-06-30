import { type ChangeEvent, type SyntheticEvent, useRef } from "react";
import type { PlikMediow } from "../../../domena/media/typyMediow";
import type { MetadaneWideoPlikuMediow } from "../../../domena/projekt/mediaProjektu";

type WlasciwosciPaneluImportuMediow = {
  rozszerzeniaWideo: readonly string[];
  listaPlikowMediow: PlikMediow[];
  bladImportuMediow?: string;
  wybierzPlikWideo: (plik: File | null) => void;
  zapiszMetadaneWideo: (
    idPlikuMediow: string,
    metadaneWideo: MetadaneWideoPlikuMediow
  ) => void;
};

const wartoscNiedostepna = "Niedostępne w przeglądarce";
const wartoscBezAnalizyStrumienia = "Niedostępne bez analizy strumienia";

function formatujRozmiarPliku(rozmiarBajtow: number): string {
  if (rozmiarBajtow < 1024) {
    return `${rozmiarBajtow} B`;
  }

  if (rozmiarBajtow < 1024 * 1024) {
    return `${(rozmiarBajtow / 1024).toFixed(1)} KB`;
  }

  return `${(rozmiarBajtow / (1024 * 1024)).toFixed(1)} MB`;
}

function formatujStatusImportu(statusImportu: PlikMediow["statusImportu"]): string {
  if (statusImportu === "zaimportowany") {
    return "Zaimportowany";
  }

  return statusImportu;
}

function formatujDlugoscPliku(czasTrwaniaMs?: number): string {
  if (czasTrwaniaMs === undefined) {
    return "Wczytywanie metadanych";
  }

  const laczneDziesiateSekundy = Math.round(czasTrwaniaMs / 100);
  const dziesiateSekundy = laczneDziesiateSekundy % 10;
  const laczneSekundy = Math.floor(laczneDziesiateSekundy / 10);
  const sekundy = laczneSekundy % 60;
  const laczneMinuty = Math.floor(laczneSekundy / 60);
  const minuty = laczneMinuty % 60;
  const godziny = Math.floor(laczneMinuty / 60);

  return `${String(godziny).padStart(2, "0")}:${String(minuty).padStart(
    2,
    "0"
  )}:${String(sekundy).padStart(2, "0")}.${dziesiateSekundy}`;
}

function formatujRozdzielczosc(plikMediow: PlikMediow): string {
  if (!plikMediow.szerokoscWideo || !plikMediow.wysokoscWideo) {
    return "Wczytywanie metadanych";
  }

  return `${plikMediow.szerokoscWideo} x ${plikMediow.wysokoscWideo}`;
}

function formatujDateIso(dataIso?: string): string {
  if (!dataIso) {
    return "Brak danych";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dataIso));
}

export function Panel_Importu_Mediow({
  rozszerzeniaWideo,
  listaPlikowMediow,
  bladImportuMediow,
  wybierzPlikWideo,
  zapiszMetadaneWideo
}: WlasciwosciPaneluImportuMediow) {
  const polePliku = useRef<HTMLInputElement>(null);

  function otworzWyborPliku() {
    polePliku.current?.click();
  }

  function obsluzZmianePliku(zdarzenie: ChangeEvent<HTMLInputElement>) {
    const plik = zdarzenie.currentTarget.files?.[0] ?? null;

    wybierzPlikWideo(plik);
    zdarzenie.currentTarget.value = "";
  }

  function obsluzWczytanieMetadanychWideo(
    idPlikuMediow: string,
    zdarzenie: SyntheticEvent<HTMLVideoElement>
  ) {
    const elementWideo = zdarzenie.currentTarget;

    zapiszMetadaneWideo(idPlikuMediow, {
      czasTrwaniaMs: Number.isFinite(elementWideo.duration)
        ? Math.round(elementWideo.duration * 1000)
        : undefined,
      szerokoscWideo: elementWideo.videoWidth || undefined,
      wysokoscWideo: elementWideo.videoHeight || undefined
    });
  }

  return (
    <section className="panel-importu-mediow" aria-labelledby="import-mediow">
      <div className="panel-importu-mediow__naglowek">
        <p className="panel-importu-mediow__etykieta">Media projektu</p>
        <h2 id="import-mediow">Import mediów</h2>
        <p className="panel-importu-mediow__opis">
          Wybierz jeden plik wideo do projektu.
        </p>
      </div>

      <div className="panel-importu-mediow__akcje">
        <input
          ref={polePliku}
          className="panel-importu-mediow__input"
          type="file"
          accept={rozszerzeniaWideo.join(",")}
          onChange={obsluzZmianePliku}
        />
        <button
          className="panel-importu-mediow__przycisk"
          type="button"
          onClick={otworzWyborPliku}
        >
          Importuj wideo
        </button>
        <span className="panel-importu-mediow__formaty">
          {rozszerzeniaWideo.join(", ")}
        </span>
      </div>

      {bladImportuMediow ? (
        <p className="panel-importu-mediow__blad" role="alert">
          {bladImportuMediow}
        </p>
      ) : null}

      <div className="panel-importu-mediow__lista" aria-live="polite">
        {listaPlikowMediow.length === 0 ? (
          <p className="panel-importu-mediow__pusty">Nie zaimportowano pliku.</p>
        ) : (
          <ul className="lista-plikow-mediow">
            {listaPlikowMediow.map((plikMediow) => (
              <li className="plik-mediow" key={plikMediow.id}>
                <video
                  className="plik-mediow__podglad"
                  src={plikMediow.objectUrl}
                  controls
                  preload="metadata"
                  onLoadedMetadata={(zdarzenie) =>
                    obsluzWczytanieMetadanychWideo(plikMediow.id, zdarzenie)
                  }
                />
                <div className="plik-mediow__sekcje">
                  <section className="plik-mediow__sekcja">
                    <h3>Ogólne</h3>
                    <dl className="plik-mediow__dane">
                      <div>
                        <dt>Nazwa pliku</dt>
                        <dd>{plikMediow.nazwaPliku}</dd>
                      </div>
                      <div>
                        <dt>Rozszerzenie</dt>
                        <dd>{plikMediow.rozszerzenie}</dd>
                      </div>
                      <div>
                        <dt>Rozmiar</dt>
                        <dd>{formatujRozmiarPliku(plikMediow.rozmiarBajtow)}</dd>
                      </div>
                      <div>
                        <dt>Typ MIME</dt>
                        <dd>{plikMediow.typMime || "Brak danych"}</dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>{formatujStatusImportu(plikMediow.statusImportu)}</dd>
                      </div>
                      <div>
                        <dt>Lokalizacja na dysku</dt>
                        <dd>{wartoscNiedostepna}</dd>
                      </div>
                      <div>
                        <dt>Data utworzenia pliku</dt>
                        <dd>{wartoscNiedostepna}</dd>
                      </div>
                      <div>
                        <dt>Data modyfikacji pliku</dt>
                        <dd>{formatujDateIso(plikMediow.dataModyfikacjiPlikuIso)}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="plik-mediow__sekcja">
                    <h3>Wideo</h3>
                    <dl className="plik-mediow__dane">
                      <div>
                        <dt>Długość pliku</dt>
                        <dd>{formatujDlugoscPliku(plikMediow.czasTrwaniaMs)}</dd>
                      </div>
                      <div>
                        <dt>Klatkaż</dt>
                        <dd>{wartoscBezAnalizyStrumienia}</dd>
                      </div>
                      <div>
                        <dt>Rozdzielczość</dt>
                        <dd>{formatujRozdzielczosc(plikMediow)}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="plik-mediow__sekcja">
                    <h3>Audio</h3>
                    <dl className="plik-mediow__dane">
                      <div>
                        <dt>Liczba kanałów</dt>
                        <dd>{wartoscBezAnalizyStrumienia}</dd>
                      </div>
                      <div>
                        <dt>Próbkowanie</dt>
                        <dd>{wartoscBezAnalizyStrumienia}</dd>
                      </div>
                    </dl>
                  </section>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
