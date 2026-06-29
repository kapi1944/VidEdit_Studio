type WlasciwosciPaneluImportuMediow = {
  rozszerzeniaWideo: readonly string[];
};

export function Panel_Importu_Mediow({
  rozszerzeniaWideo
}: WlasciwosciPaneluImportuMediow) {
  return (
    <section className="panel-importu-mediow" aria-labelledby="import-mediow">
      <div>
        <p className="panel-importu-mediow__etykieta">Moduł domenowy</p>
        <h2 id="import-mediow">Import mediów</h2>
        <p className="panel-importu-mediow__opis">
          Przygotowany placeholder importu jednego pliku wideo bez dostępu do dysku.
        </p>
      </div>

      <div className="panel-importu-mediow__ramka">
        <span className="panel-importu-mediow__status">Gotowe typy i walidacja</span>
        <span className="panel-importu-mediow__formaty">
          {rozszerzeniaWideo.join(", ")}
        </span>
      </div>
    </section>
  );
}
