import { type ChangeEvent, useRef } from "react";

export type StatusImportuMediow =
  | "bezczynny"
  | "wybieranie"
  | "odczyt_metadanych"
  | "gotowe"
  | "blad";

type WlasciwosciPaneluImportuMediow = {
  rozszerzeniaWideo: readonly string[];
  bladImportuMediow?: string;
  statusImportuMediow: StatusImportuMediow;
  naWybranoPlik: (plik: File) => void;
};

function pobierzKomunikatStatusuImportu(
  statusImportuMediow: StatusImportuMediow
): string | undefined {
  if (statusImportuMediow === "odczyt_metadanych") {
    return "Odczytuje metadane...";
  }

  if (statusImportuMediow === "gotowe") {
    return "Metadane odczytane";
  }

  if (statusImportuMediow === "blad") {
    return "Nie udalo sie odczytac metadanych";
  }

  return undefined;
}

export function Panel_Importu_Mediow({
  rozszerzeniaWideo,
  bladImportuMediow,
  statusImportuMediow,
  naWybranoPlik
}: WlasciwosciPaneluImportuMediow) {
  const polePliku = useRef<HTMLInputElement>(null);
  const komunikatStatusuImportu = pobierzKomunikatStatusuImportu(
    statusImportuMediow
  );

  function otworzWyborPliku() {
    polePliku.current?.click();
  }

  function obsluzZmianePliku(zdarzenie: ChangeEvent<HTMLInputElement>) {
    const plik = zdarzenie.currentTarget.files?.[0];

    if (plik) {
      naWybranoPlik(plik);
    }

    zdarzenie.currentTarget.value = "";
  }

  return (
    <section className="panel-importu-mediow" aria-labelledby="import-mediow">
      <div className="panel-importu-mediow__naglowek">
        <p className="panel-importu-mediow__etykieta">Media projektu</p>
        <h2 id="import-mediow">Import mediow</h2>
        <p className="panel-importu-mediow__opis">
          Obecnie import dziala dla pojedynczego pliku wideo.
        </p>
      </div>

      <div className="panel-importu-mediow__akcje">
        <input
          ref={polePliku}
          className="panel-importu-mediow__input"
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.mkv"
          onChange={obsluzZmianePliku}
        />
        <button
          className="panel-importu-mediow__przycisk"
          type="button"
          onClick={otworzWyborPliku}
        >
          Wybierz plik wideo
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

      {komunikatStatusuImportu ? (
        <p className="panel-importu-mediow__status" role="status">
          {komunikatStatusuImportu}
        </p>
      ) : null}
    </section>
  );
}
