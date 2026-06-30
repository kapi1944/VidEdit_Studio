import { useState } from "react";
import { Panel_Osi_Czasu } from "../moduly/timeline/komponenty/Panel_Osi_Czasu";
import { Panel_Importu_Mediow } from "../moduly/media/komponenty/Panel_Importu_Mediow";
import {
  OBSLUGIWANE_ROZSZERZENIA_WIDEO,
  zaimportujPlikMediow
} from "../moduly/media/indeksMediow";
import {
  aktualizujMetadaneWideoPlikuMediow,
  dodajPlikDoProjektu,
  type MetadaneWideoPlikuMediow,
  utworzPustyProjekt
} from "../moduly/projekt/indeksProjektu";
import { formatujCzas } from "../domena/czas/formatowanieCzasu";

export function Aplikacja() {
  const [projekt, ustawProjekt] = useState(() =>
    utworzPustyProjekt("Projekt bez nazwy")
  );
  const [bladImportuMediow, ustawBladImportuMediow] = useState<string>();

  const czasStartowy = formatujCzas(
    0,
    projekt.ustawienia.formatWyswietlaniaCzasu,
    projekt.ustawienia.liczbaKlatekNaSekunde
  );

  function wybierzPlikWideo(plik: File | null) {
    const wynikImportu = zaimportujPlikMediow(plik);

    if (!wynikImportu.czySukces) {
      ustawBladImportuMediow(
        wynikImportu.bledy[0]?.komunikat ??
          "Nie udało się zaimportować pliku."
      );
      return;
    }

    ustawProjekt((aktualnyProjekt) =>
      dodajPlikDoProjektu(aktualnyProjekt, wynikImportu.dane)
    );
    ustawBladImportuMediow(undefined);
  }

  function zapiszMetadaneWideo(
    idPlikuMediow: string,
    metadaneWideo: MetadaneWideoPlikuMediow
  ) {
    ustawProjekt((aktualnyProjekt) =>
      aktualizujMetadaneWideoPlikuMediow(
        aktualnyProjekt,
        idPlikuMediow,
        metadaneWideo
      )
    );
  }

  return (
    <main className="ekran-startowy">
      <section className="naglowek-aplikacji">
        <p className="etykieta-wersji">Wersja webowa</p>
        <h1>VidEdit Studio</h1>
        <p className="opis-aplikacji">
          Prosty edytor do szybkiego czyszczenia nagrań mówionych.
        </p>
      </section>

      <section className="sekcja-aplikacji" aria-labelledby="nastepne-moduly">
        <h2 id="nastepne-moduly">Następne moduły</h2>
        <ul className="lista-modulow">
          <li>Analiza techniczna pliku wideo</li>
          <li>Wykrywanie ciszy i propozycje cięć</li>
          <li>Ręczne zatwierdzanie zmian</li>
          <li>Eksport przyciętego filmu</li>
        </ul>
      </section>

      <Panel_Importu_Mediow
        rozszerzeniaWideo={OBSLUGIWANE_ROZSZERZENIA_WIDEO}
        listaPlikowMediow={projekt.media}
        bladImportuMediow={bladImportuMediow}
        wybierzPlikWideo={wybierzPlikWideo}
        zapiszMetadaneWideo={zapiszMetadaneWideo}
      />

      <Panel_Osi_Czasu
        nazwaProjektu={projekt.nazwa}
        czasPoczatku={czasStartowy}
      />
    </main>
  );
}
