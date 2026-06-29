type WlasciwosciPaneluOsiCzasu = {
  nazwaProjektu: string;
  czasPoczatku: string;
};

export function Panel_Osi_Czasu({
  nazwaProjektu,
  czasPoczatku
}: WlasciwosciPaneluOsiCzasu) {
  return (
    <section className="panel-osi-czasu" aria-label="Oś czasu projektu">
      <div className="panel-osi-czasu__naglowek">
        <h2 className="panel-osi-czasu__tytul">Oś czasu: {nazwaProjektu}</h2>
        <span className="panel-osi-czasu__czas">{czasPoczatku}</span>
      </div>
      <div className="panel-osi-czasu__tor" aria-hidden="true">
        <span className="panel-osi-czasu__znacznik" />
      </div>
      <p className="panel-osi-czasu__opis">
        Placeholder osi czasu. Segmenty ciszy i cięcia pojawią się w kolejnych etapach.
      </p>
    </section>
  );
}
