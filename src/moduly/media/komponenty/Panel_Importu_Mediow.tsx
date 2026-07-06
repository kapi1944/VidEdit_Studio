import { type ChangeEvent, useRef } from "react";

export type StatusImportuMediow =
  | "bezczynny"
  | "wybieranie"
  | "odczyt_metadanych"
  | "gotowe"
  | "blad";

type WlasciwosciPaneluImportuMediow = {
  rozszerzeniaMediow: readonly string[];
  bladImportuMediow?: string;
  statusImportuMediow: StatusImportuMediow;
  naWybranoPliki: (pliki: File[]) => void;
};

function pobierzKomunikatStatusuImportu(
  statusImportuMediow: StatusImportuMediow
): string | undefined {
  if (statusImportuMediow === "wybieranie") {
    return "Przygotowuje import...";
  }

  if (statusImportuMediow === "odczyt_metadanych") {
    return "Odczytuje metadane...";
  }

  if (statusImportuMediow === "gotowe") {
    return "Import zakonczony";
  }

  if (statusImportuMediow === "blad") {
    return "Import zakonczony z uwagami";
  }

  return undefined;
}

export function Panel_Importu_Mediow({
  rozszerzeniaMediow,
  bladImportuMediow,
  statusImportuMediow,
  naWybranoPliki
}: WlasciwosciPaneluImportuMediow) {
  const polePliku = useRef<HTMLInputElement>(null);
  const komunikatStatusuImportu = pobierzKomunikatStatusuImportu(
    statusImportuMediow
  );

  function otworzWyborPliku() {
    polePliku.current?.click();
  }

  function obsluzZmianePliku(zdarzenie: ChangeEvent<HTMLInputElement>) {
    const pliki = Array.from(zdarzenie.currentTarget.files ?? []);

    if (pliki.length > 0) {
      naWybranoPliki(pliki);
    }

    zdarzenie.currentTarget.value = "";
  }

  return (
    <section className="panel-importu-mediow" aria-labelledby="import-mediow">
      <div className="panel-importu-mediow__naglowek">
        <p className="panel-importu-mediow__etykieta">Media projektu</p>
        <h2 id="import-mediow">Import mediow</h2>
        <p className="panel-importu-mediow__opis">
          Mozesz wybrac jeden lub wiele plikow wideo i grafik.
        </p>
      </div>

      <div className="panel-importu-mediow__akcje">
        <input
          ref={polePliku}
          className="panel-importu-mediow__input"
          type="file"
          multiple
          accept="video/mp4,video/webm,video/quicktime,image/png,image/jpeg,image/webp,image/gif,.mp4,.webm,.mov,.mkv,.avi,.m4v,.png,.jpg,.jpeg,.webp,.gif"
          onChange={obsluzZmianePliku}
        />
        <button
          className="panel-importu-mediow__przycisk"
          type="button"
          onClick={otworzWyborPliku}
        >
          Importuj pliki
        </button>
        <span className="panel-importu-mediow__formaty">
          {rozszerzeniaMediow.join(", ")}
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