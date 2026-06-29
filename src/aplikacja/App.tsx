import { Panel_Osi_Czasu } from "../moduly/timeline/komponenty/Panel_Osi_Czasu";
import { Panel_Importu_Mediow } from "../moduly/media/komponenty/Panel_Importu_Mediow";
import { OBSLUGIWANE_ROZSZERZENIA_WIDEO } from "../moduly/media/indeksMediow";
import { utworzPustyProjekt } from "../domena/projekt/fabrykaProjektu";
import { formatujCzas } from "../domena/czas/formatowanieCzasu";

const projektStartowy = utworzPustyProjekt("Projekt bez nazwy");

export function Aplikacja() {
  const czasStartowy = formatujCzas(
    0,
    projektStartowy.ustawienia.formatWyswietlaniaCzasu,
    projektStartowy.ustawienia.liczbaKlatekNaSekunde
  );

  return (
    <main className="ekran-startowy">
      <section className="naglowek-aplikacji">
        <p className="etykieta-wersji">Wersja fundamentu</p>
        <h1>VidEdit Studio</h1>
        <p className="opis-aplikacji">
          Prosty edytor do szybkiego czyszczenia nagrań mówionych.
        </p>
      </section>

      <section className="sekcja-aplikacji" aria-labelledby="nastepne-moduly">
        <h2 id="nastepne-moduly">Następne moduły</h2>
        <ul className="lista-modulow">
          <li>Podłączenie prawdziwego wyboru pliku</li>
          <li>Wykrywanie ciszy i propozycje cięć</li>
          <li>Ręczne zatwierdzanie zmian</li>
          <li>Eksport przyciętego filmu</li>
        </ul>
      </section>

      <Panel_Importu_Mediow
        rozszerzeniaWideo={OBSLUGIWANE_ROZSZERZENIA_WIDEO}
      />

      <Panel_Osi_Czasu
        nazwaProjektu={projektStartowy.nazwa}
        czasPoczatku={czasStartowy}
      />
    </main>
  );
}
