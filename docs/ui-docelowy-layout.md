# Docelowy layout UI VidEdit Studio

## Stan obecny

Aplikacja znajduje sie we wlasciwym katalogu wewnetrznym `VidEdit_Studio/VidEdit_Studio`. Katalog nadrzedny zawiera repozytorium, kopie zapasowe i archiwa, ale realne pliki aplikacji webowej sa w katalogu wewnetrznym.

Projekt jest obecnie aplikacja React + TypeScript + Vite. Skrypty w `package.json` uruchamiaja Vite na `127.0.0.1:5180` i nie wymagaja Electrona. Zaleznosci sa male: `react`, `react-dom`, Vite, TypeScript, Vitest i typy.

Glowny ekran znajduje sie w `src/aplikacja/App.tsx`. Komponent `Aplikacja` laczy dzisiaj kilka odpowiedzialnosci UI:

- naglowek i przelacznik trybu wygladu,
- lista nastepnych modulow,
- import pliku wideo,
- lista mediow projektu,
- os czasu,
- panel propozycji ciec.

Style sa obecnie scentralizowane w `src/aplikacja/style.css`. Istniejace komponenty UI sa juz wydzielone w modulach:

- `src/moduly/media/komponenty/Panel_Importu_Mediow.tsx`,
- `src/moduly/media/komponenty/Lista_Mediow.tsx`,
- `src/moduly/media/komponenty/Karta_Medium.tsx`,
- `src/moduly/timeline/komponenty/Panel_Osi_Czasu.tsx`,
- `src/moduly/timeline/komponenty/Pasek_Klipu.tsx`,
- `src/moduly/timeline/komponenty/Segment_Ciszy_Na_Timeline.tsx`,
- `src/moduly/timeline/komponenty/Znacznik_Czasu.tsx`,
- `src/moduly/propozycje-ciec/komponenty/Panel_Propozycji_Ciec.tsx`.

Stan projektu, mediow, ciszy i propozycji ciec jest trzymany lokalnie w `src/aplikacja/App.tsx`:

- `projekt` powstaje przez `utworzPustyProjekt("Projekt bez nazwy")`,
- `projekt.media` przechowuje liste `PlikMediow`,
- `projekt.audio.segmentyCiszy` i awaryjnie `projekt.timeline.segmentyCiszy` sa zrodlem segmentow ciszy dla timeline,
- `projekt.timeline.propozycjeCiec` przechowuje decyzje i propozycje ciec,
- `podgladyMediow` przechowuje lokalne `objectUrl` i miniatury dla przegladarkowego podgladu,
- `idAktywnegoSegmentuCiszy` i `aktualnyCzasTimelineMs` obsluguja wybor segmentu na osi czasu,
- `trybWygladu` jest zapisywany w `localStorage` pod kluczem `videdit-studio.tryb-wygladu`.

Wymagane typy domenowe juz istnieja:

- `ProjektMontazu` w `src/domena/projekt/typyProjektu.ts`,
- `PlikMediow` w `src/domena/media/typyMediow.ts`,
- `SegmentCiszy` w `src/domena/timeline/typyTimeline.ts`,
- `PropozycjaCiecia` w `src/domena/timeline/typyTimeline.ts`.

Wazne: dokumenty `docs/architektura.md` i `docs/decyzje-adr/0001-fundament-projektu.md` zawieraja historyczne wzmianki o Electronie. Aktualny kierunek dla UI jest webowy i bez Electrona.

## Docelowy uklad aplikacji

Docelowy szkielet powinien byc narzedziowy, gesty i przewidywalny. Pierwszy ekran ma pokazywac od razu roboczy layout edytora, a nie ekran startowy lub landing page.

### Pasek gorny

Pasek gorny powinien zawierac nazwe aplikacji, nazwe projektu, podstawowe akcje projektu i przelacznik trybu wygladu. Na tym etapie akcje moga byc pasywne albo ograniczone do istniejacych mozliwosci. Nie nalezy dodawac zapisu projektu, eksportu ani automatyzacji, dopoki logika nie jest gotowa.

Proponowany komponent: `PasekGornyAplikacji`.

### Lewy panel workflow i mediow

Lewy panel powinien laczyc dwa obszary: prosty workflow MVP oraz media projektu. Workflow moze pokazywac kroki: import, analiza audio, cisza, decyzje, eksport. Media powinny wykorzystywac istniejacy import i liste mediow, bez zmiany ich logiki.

Proponowane komponenty: `PanelWorkflow`, `PanelMediowProjektu`.

### Glowny obszar roboczy

Glowny obszar roboczy powinien byc miejscem podgladu wideo i kontekstu aktualnego wyboru. Na pierwszym etapie moze uzywac danych z pierwszego pliku wideo i istniejacego `objectUrl` z `podgladyMediow`. Nie powinien uruchamiac FFmpeg ani dodawac przetwarzania audio/wideo.

Proponowane komponenty: `ObszarRoboczy`, `PodgladWideo`.

### Prawy panel decyzji

Prawy panel powinien skupic decyzje uzytkownika dotyczace propozycji ciec. Obecny `Panel_Propozycji_Ciec` moze byc baza, ale warto rozdzielic liste od pojedynczej karty propozycji. AI i automatyzacja moga w przyszlosci sugerowac, ale decyzja musi pozostac po stronie uzytkownika.

Proponowane komponenty: `PanelDecyzji`, `ListaPropozycjiCiec`, `KartaPropozycjiCiecia`.

### Dolny timeline

Dolny timeline powinien byc stale widoczny pod obszarem roboczym. Obecny `Panel_Osi_Czasu`, `Pasek_Klipu`, `Segment_Ciszy_Na_Timeline` i `Znacznik_Czasu` sa dobrym fundamentem. Zmiana powinna dotyczyc glownie ulozenia i nazwy kontenera, nie przeliczen czasu.

Proponowany komponent: `TimelineMontazu`.

### Pasek statusu

Pasek statusu powinien pokazywac krotki stan projektu: liczba mediow, status importu, status analizy audio, liczba segmentow ciszy, liczba propozycji oczekujacych. Powinien czytac stan z `ProjektMontazu` i stanow UI, ale nie wykonywac logiki domenowej.

Proponowany komponent: `PasekStatusu`.

## Proponowane komponenty React

### `AplikacjaVidEdit`

Docelowy kontener layoutu. Powinien zastapic obecna kompozycje w `Aplikacja`, ale nie musi od razu przejmowac calego stanu. Najbezpieczniej najpierw utworzyc go jako komponent prezentacyjny przyjmujacy dane i akcje z `Aplikacja`.

### `PasekGornyAplikacji`

Naglowek narzedziowy aplikacji. Powinien dostawac nazwe projektu, tryb wygladu i akcje zmiany trybu. Moze przejac obecny fragment `naglowek-aplikacji` z `App.tsx`.

### `PanelWorkflow`

Lekka lista krokow MVP. Powinna bazowac na istniejacym stanie: czy sa media, jaki jest `statusAnalizyAudio`, ile jest segmentow ciszy i propozycji ciec. Bez automatycznego uruchamiania kolejnych krokow.

### `PanelMediowProjektu`

Kontener na `Panel_Importu_Mediow` i `Lista_Mediow`. Powinien tylko ukladac istniejace komponenty, bez zmiany importu i bez zmiany modelu `PlikMediow`.

### `ObszarRoboczy`

Centralny kontener widoku. Powinien trzymac `PodgladWideo` oraz ewentualny stan pusty, gdy nie ma zaimportowanego pliku.

### `PodgladWideo`

Komponent prezentacyjny oparty o element `<video>` i `objectUrl` z `podgladyMediow`. Nie powinien czytac plikow, tworzyc miniatur ani wykonywac przetwarzania.

### `PanelDecyzji`

Prawy panel laczacy podsumowanie i liste propozycji ciec. Moze opakowac obecny `Panel_Propozycji_Ciec`, a potem stopniowo rozdzielac go na liste i karty.

### `ListaPropozycjiCiec`

Lista `PropozycjaCiecia[]` z obsluga stanu pustego. Powinna delegowac render pojedynczego elementu do `KartaPropozycjiCiecia`.

### `KartaPropozycjiCiecia`

Pojedyncza propozycja ciecia: zakres czasu, status, powod, akcje zatwierdzenia, odrzucenia i cofniecia decyzji. Powinna korzystac z istniejacych funkcji aktualizacji statusu przez propsy.

### `TimelineMontazu`

Docelowa nazwa kontenera dolnego timeline. Moze zaczac jako cienka warstwa nad `Panel_Osi_Czasu`, zeby nie ruszac przeliczen w `src/moduly/timeline/przeliczCzasNaPozycje.ts`.

### `PasekStatusu`

Dolny lub przydolny pasek z metrykami projektu. Powinien byc czysto prezentacyjny i wyliczac tylko proste liczniki z przekazanych danych.

## Etapy wdrozenia

### Etap 1: szkielet layoutu

Cel: zastapic liniowy `ekran-startowy` ukladem edytora: gora, lewy panel, srodek, prawy panel, dolny timeline, status.

Pliki do zmiany:

- `src/aplikacja/App.tsx`,
- `src/aplikacja/style.css`,
- opcjonalnie nowe komponenty w `src/aplikacja/komponenty`.

Ostroznie:

- nie przenosic jeszcze logiki importu, objectUrl ani decyzji ciec poza `Aplikacja`,
- najpierw utworzyc layout z istniejacych komponentow.

### Etap 2: pasek gorny i status projektu

Cel: wydzielic `PasekGornyAplikacji` i `PasekStatusu`.

Pliki do zmiany:

- `src/aplikacja/App.tsx`,
- `src/aplikacja/komponenty/PasekGornyAplikacji.tsx`,
- `src/aplikacja/komponenty/PasekStatusu.tsx`,
- `src/aplikacja/style.css`.

Nie zmieniac:

- `src/domena/projekt/*`,
- `src/infrastruktura/zapis/portZapisuProjektu.ts`.

### Etap 3: lewy panel workflow/media

Cel: wydzielic `PanelWorkflow` i `PanelMediowProjektu`, opierajac sie na obecnych komponentach importu i listy mediow.

Pliki do zmiany:

- `src/aplikacja/komponenty/PanelWorkflow.tsx`,
- `src/aplikacja/komponenty/PanelMediowProjektu.tsx`,
- `src/aplikacja/App.tsx`,
- `src/aplikacja/style.css`.

Nie zmieniac:

- `src/moduly/media/importMediow.ts`,
- `src/domena/media/*`,
- `src/infrastruktura/media/*`, chyba ze przyszly etap wprost dotyczy importu.

### Etap 4: glowny obszar podgladu

Cel: utworzyc `ObszarRoboczy` i `PodgladWideo`, uzywajac juz istniejacego `objectUrl` dla pierwszego pliku wideo.

Pliki do zmiany:

- `src/aplikacja/komponenty/ObszarRoboczy.tsx`,
- `src/aplikacja/komponenty/PodgladWideo.tsx`,
- `src/aplikacja/App.tsx`,
- `src/aplikacja/style.css`.

Ostroznie:

- `URL.createObjectURL` i `URL.revokeObjectURL` powinny nadal miec jasnego wlasciciela,
- komponent podgladu nie powinien sam importowac plikow ani czytac metadanych.

### Etap 5: prawy panel decyzji

Cel: przeniesc obecny panel propozycji do prawego panelu i rozdzielic go na `PanelDecyzji`, `ListaPropozycjiCiec` oraz `KartaPropozycjiCiecia`.

Pliki do zmiany:

- `src/moduly/propozycje-ciec/komponenty/Panel_Propozycji_Ciec.tsx` albo nowe komponenty obok niego,
- `src/aplikacja/komponenty/PanelDecyzji.tsx`,
- `src/aplikacja/App.tsx`,
- `src/aplikacja/style.css`.

Nie zmieniac:

- `src/moduly/propozycje-ciec/propozycjeCiec.ts`,
- testow decyzji ciec, jezeli zmiana dotyczy tylko UI.

### Etap 6: timeline

Cel: umiescic timeline stale na dole layoutu i ewentualnie nadac mu docelowy kontener `TimelineMontazu`.

Pliki do zmiany:

- `src/moduly/timeline/komponenty/Panel_Osi_Czasu.tsx` albo nowy kontener obok,
- `src/aplikacja/App.tsx`,
- `src/aplikacja/style.css`.

Nie zmieniac:

- `src/moduly/timeline/przeliczCzasNaPozycje.ts`,
- `src/domena/czas/*`,
- testow przeliczen czasu, jezeli nie zmienia sie logika.

## Pliki, ktore warto zmieniac w kolejnych etapach

- `src/aplikacja/App.tsx` - tymczasowy wlasciciel stanu i kompozycji; stopniowo odchudzac przez komponenty prezentacyjne.
- `src/aplikacja/style.css` - obecne globalne style; mozna uporzadkowac selektory pod layout edytora.
- `src/aplikacja/komponenty/*` - proponowane miejsce na komponenty ukladu aplikacji.
- `src/moduly/media/komponenty/*` - do lekkiego dopasowania wizualnego panelu mediow.
- `src/moduly/propozycje-ciec/komponenty/*` - do rozdzielenia listy i karty propozycji.
- `src/moduly/timeline/komponenty/*` - do dopasowania kontenera timeline, bez zmiany matematyki czasu.

## Pliki, ktorych nie ruszac w tym etapie

- `src/infrastruktura/ffmpeg/*` - brak zmian FFmpeg w tym etapie.
- `src/moduly/audio/*` - brak wdrozenia transkrypcji, dubli lub zaawansowanej analizy.
- `src/moduly/cisza/*` - brak zmian w wykrywaniu ciszy.
- `src/moduly/eksport/*` - brak zaawansowanego eksportu.
- `src/domena/projekt/*`, poza przyszlymi zmianami wynikajacymi z realnej potrzeby modelu.
- `testy/**` - nie zmieniac, jezeli UI layout nie zmienia logiki.
- `package.json` - nie dodawac zaleznosci dla samego layoutu.

## Ryzyka techniczne i miejsca ostroznosci

- `App.tsx` jest obecnie centralnym miejscem stanu. Zbyt szybkie przenoszenie stanu moze rozbic import mediow, podglady `objectUrl` i decyzje ciec.
- Trzeba pilnowac cyklu zycia `objectUrl`, bo obecna aplikacja zwalnia podglady przez `URL.revokeObjectURL`.
- `ProjektMontazu.audio.segmentyCiszy` i `ProjektMontazu.timeline.segmentyCiszy` sa obecnie czytane z fallbackiem. Przed wiekszymi zmianami warto zdecydowac, ktore zrodlo jest docelowe dla UI.
- `Panel_Propozycji_Ciec` miesci dzis liste i karte w jednym komponencie. Rozdzielanie powinno zachowac te same propsy akcji.
- `Panel_Osi_Czasu` jest powiazany z przeliczeniami czasu. Layout moze sie zmieniac, ale funkcje `przeliczCzasNaPozycje` i `przeliczZakresCzasuNaPolozenie` powinny zostac nietkniete.
- Istniejace dokumenty i czesc tekstow UI maja widoczne problemy z kodowaniem znakow w odczycie terminalowym. Przed masowa korekta tekstow warto zrobic osobny etap tylko dla UTF-8 i widocznych napisow.
- `docs/decyzje-adr/0001-fundament-projektu.md` jest historyczne i wspomina Electrona. Dalsze prace UI powinny trzymac sie aktualnej zasady: bez Electrona.
- Port `5173` nie powinien byc uzywany ani zwalniany. Aktualny skrypt dev uzywa `5180`.

## Rekomendacja

Najbezpieczniejszy kolejny krok to etap 1: utworzyc sam szkielet layoutu i ulozyc w nim istniejace komponenty bez zmiany logiki domenowej. Dopiero po tym warto wydzielac pasek gorny, status, panel mediow, podglad wideo, panel decyzji i timeline na osobne komponenty.
