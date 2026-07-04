# Plan MVP: wiele mediow i klipy timeline

## Cel korekty MVP

VidEdit Studio ma pozostac prostym edytorem MVP, ale model aplikacji nie moze juz zakladac jednego pliku wideo. MVP ma wspierac wiele mediow projektu, jedna glowna os czasu i klipy ukladane na tej osi.

Ten dokument opisuje zakres docelowy MVP oraz fundament modelu danych. Nie oznacza jeszcze wdrozenia pelnego drag and drop, ciecia, eksportu wielu klipow ani zaawansowanego UI.

## Zakres MVP

- Import wielu plikow wideo i grafik.
- Biblioteka mediow projektu jako lista wszystkich dodanych plikow.
- Jedna glowna os czasu projektu.
- Klipy umieszczane na osi czasu w wybranym miejscu.
- Jeden klip pochodzi z jednego pliku mediow: wideo albo grafiki.
- Klip ma czas startu na timeline.
- Klip ma czas trwania na timeline.
- Klip wideo moze miec czas wejscia i czas wyjscia ze zrodla.
- Grafika ma czas trwania ustawiany przez uzytkownika.
- Proste ciecie klipu tworzy dwa klipy na timeline.
- Dociaganie do siatki moze byc wlaczone albo wylaczone.

## Model mediow projektu

`ProjektMontazu.media` pozostaje biblioteka mediow projektu. Docelowo moze zawierac wiecej niz jeden plik i rozne rodzaje mediow:

- `wideo`,
- `grafika`,
- techniczne `audio`, jezeli jest potrzebne dla analizy.

Ten etap nie zmienia jeszcze logiki importu w UI. Obecne miejsca, ktore nadal mowia o jednym pliku wideo, beda aktualizowane w kolejnych etapach.

## Model timeline

`ProjektMontazu.timeline` przechowuje jedna glowna os czasu. Minimalny model dla MVP sklada sie z:

- `klipy`,
- `ustawieniaDociagania`,
- dotychczasowych `segmentyCiszy`,
- dotychczasowych `propozycjeCiec`.

`KlipTimeline` opisuje pojedynczy element montazu:

- `id`,
- `idPlikuMediow`,
- `rodzaj`: `wideo` albo `grafika`,
- `czasStartuMs`,
- `czasTrwaniaMs`,
- opcjonalne `zrodloStartMs` dla wideo,
- opcjonalne `zrodloKoniecMs` dla wideo,
- `sciezka`: na razie stala `wideo-1`,
- `nazwa`,
- opcjonalne `kolor`,
- opcjonalne `czyZablokowany`.

Regula domenowa: `idPlikuMediow` musi wskazywac istniejacy plik z `ProjektMontazu.media`.

## Ciecie klipu

Docelowe proste ciecie dzieli jeden `KlipTimeline` na dwa klipy:

- pierwszy konczy sie w punkcie ciecia,
- drugi zaczyna sie w punkcie ciecia,
- oba zachowuja odwolanie do tego samego `idPlikuMediow`,
- dla wideo czasy zrodla sa przesuwane zgodnie z punktem ciecia.

Ten etap nie implementuje jeszcze operacji ciecia.

## Dociaganie timeline

Minimalne ustawienia dociagania:

- `wlaczone`,
- `tryb`: `brak`, `czas` albo `klatki`,
- `jednostka`,
- opcjonalne `krokMs`,
- opcjonalne `liczbaKlatek`,
- opcjonalne `fpsBazowy`.

Wartosci MVP:

- bez dociagania,
- 1 sekunda,
- 0.5 sekundy,
- 0.1 sekundy,
- 1 klatka,
- 5 klatek,
- 10 klatek.

Ten etap definiuje ustawienia, ale nie implementuje jeszcze samego dociagania pozycji.

## Poza zakresem tego etapu

- Drag and drop klipow.
- Przesuwanie klipow mysza.
- Implementacja ciecia klipow.
- Eksport wielu klipow.
- Zmiany FFmpeg.
- Zmiany wykrywania ciszy.
- Przebudowa `App.tsx`.
- Zaawansowany UI timeline.

## Kolejny bezpieczny krok

Nastepny etap powinien usunac zalozenie jednego pliku z operacji dodawania mediow i importu UI, a dopiero potem podpiac tworzenie klipow na timeline.
