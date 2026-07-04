import { type ChangeEvent, useRef } from "react";

type WlasciwosciPaneluImportuMediow = {
  rozszerzeniaWideo: readonly string[];
  bladImportuMediow?: string;
  naWybranoPlik: (plik: File) => void;
};

export function Panel_Importu_Mediow({
  rozszerzeniaWideo,
  bladImportuMediow,
  naWybranoPlik
}: WlasciwosciPaneluImportuMediow) {
  const polePliku = useRef<HTMLInputElement>(null);

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
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.mkv"
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
    </section>
  );
}
