# Architektura VidEdit Studio

VidEdit Studio jest lokalną aplikacją webową opartą o React, TypeScript i Vite. Pierwszy etap tworzy bezpieczny fundament projektu, bez funkcji montażowych.

## Główne warstwy

### `aplikacja`

Warstwa startowa UI. Zawiera wejście Reacta, ekran aplikacji i style. Komponenty prezentują dane oraz wywołują funkcje z modułów lub domeny.

### `domena`

Czysta logika aplikacji: typy, model projektu, model czasu, walidacja i proste przeliczenia. Kod domenowy nie zna Reacta, Electrona, systemu plików ani FFmpeg.

### `infrastruktura`

Miejsce na integracje z narzędziami zewnętrznymi: zapis projektu, obsługa plików przeglądarkowych i lokalny FFmpeg. Infrastruktura nie powinna przenosić logiki montażu ani reguł domenowych.

### `moduly`

Grupowanie funkcji według obszarów aplikacji: projekt, media, audio, cisza, timeline, eksport, ustawienia i logi. Moduły łączą UI z domeną oraz infrastrukturą, ale nie powinny mieszać odpowiedzialności.

### `wspolne`

Wspólne typy, stałe i proste pomocniki używane przez różne warstwy.

## Dlaczego oddzielamy UI od domeny

UI zmienia się szybciej niż reguły domenowe. Oddzielenie domeny pozwala testować model projektu, czas i walidację bez uruchamiania Reacta ani Electrona. Dzięki temu przyszłe funkcje, takie jak wykrywanie ciszy lub eksport, mogą być rozwijane etapami.

## Import mediów

Pierwszy moduł importu mediów działa wyłącznie na danych wejściowych przekazanych do domeny. Waliduje nazwę pliku, ścieżkę, rozszerzenie wideo, opcjonalny czas trwania i opcjonalny rozmiar pliku.

W tym etapie import nie otwiera okna wyboru pliku, nie czyta dysku, nie używa Electron API, `fs`, FFmpeg ani FFprobe. Warstwa infrastruktury zawiera tylko port `PortWyboruPliku`, który zostanie użyty przy późniejszej implementacji adaptera desktopowego.

## Diagnostyka FFmpeg i FFprobe

FFmpeg i FFprobe są zależnościami infrastrukturalnymi. Ich dostępność jest sprawdzana poza UI i poza domeną przez funkcję diagnostyczną w `src/infrastruktura/ffmpeg`.

Diagnostyka uruchamia tylko `ffmpeg -version` oraz `ffprobe -version`, zbiera wersje i czytelne błędy. Nie analizuje audio, nie wykrywa ciszy i nie wykonuje montażu. Wynik tej diagnostyki będzie podstawą dla kolejnych etapów: wyodrębniania audio, wykrywania ciszy i eksportu.

## Model audio projektu

`ProjektMontazu.audio` przechowuje stan audio przypisany do projektu. `SciezkaAudio` opisuje pojedynczy wyodrebniony plik WAV powiazany z plikiem zrodlowym, jego czas trwania, liczbe kanalow i probkowanie. `statusAnalizyAudio` okresla, czy analiza nie zostala jeszcze zaplanowana, oczekuje, trwa, zakonczyla sie poprawnie albo bledem.

Wykryte `segmentyCiszy` sa zapisywane w `ProjektMontazu.audio.segmentyCiszy`, a ostatni blad analizy w `ProjektMontazu.audio.ostatniBladAudio`. Ten model nie uruchamia jeszcze analizy audio, wyodrebniania audio ani wykrywania ciszy.

## Czego nie wolno mieszać

- Komponenty React nie wywołują bezpośrednio FFmpeg.
- Komponenty React nie zawierają logiki wykrywania ciszy, eksportu ani odczytu plików.
- Domeny nie wolno uzależniać od Reacta, Electrona ani systemu plików.
- Infrastruktura nie powinna definiować reguł biznesowych projektu.
- Moduły nie powinny tworzyć globalnych abstrakcji bez konkretnej potrzeby.
