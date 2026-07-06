# ADR 0002: Rezygnacja z Electrona

## Status

Zaakceptowana

## Kontekst

ADR 0001 zakladal uzycie Electrona jako podstawy lokalnej aplikacji desktopowej. W praktyce projekt przeszedl na prostszy kierunek web-first: React, TypeScript i Vite uruchamiane lokalnie w przegladarce.

Electron wprowadzal dodatkowy koszt utrzymania, osobny runtime i ryzyko problemow srodowiskowych na komputerach docelowych. W aktualnym MVP nie ma funkcji, ktora wymaga Electron API jako domyslnego fundamentu aplikacji.

## Decyzja

Nie uzywamy Electrona w biezacym kierunku technicznym VidEdit Studio.

Projekt pozostaje lokalna aplikacja webowa oparta o:

- Vite jako lokalny serwer developerski i narzedzie build,
- React jako warstwe UI,
- TypeScript jako jezyk aplikacji,
- przegladarkowe API plikow tam, gdzie wystarcza ono do importu i podgladu.

Powrot do Electrona wymaga osobnej decyzji ADR oraz testow na komputerach docelowych. Do tego czasu dokumentacja, kod i skrypty nie powinny traktowac Electrona jako domyslnego kierunku.

## Konsekwencje

- Kod aplikacji nie powinien uzywac Electron API.
- Lokalne uruchamianie odbywa sie przez Vite, obecnie `npm run dev`.
- Import mediow opiera sie na danych `File` dostepnych w przegladarce, bez prob pobierania pelnej sciezki lokalnej.
- Zapis projektu musi byc projektowany jako osobna decyzja techniczna, np. przegladarkowy eksport pliku albo inny jawnie zaakceptowany adapter.
- Eksport wideo pozostaje osobnym etapem; nie zakladamy, ze wymaga on Electrona.
- Integracje lokalne, takie jak FFmpeg, musza byc uzasadnione i projektowane poza komponentami React.

## Uwagi

ADR 0001 pozostaje dokumentem historycznym dla fundamentu projektu. W zakresie runtime aplikacji ta decyzja ma pierwszenstwo przed ADR 0001.
