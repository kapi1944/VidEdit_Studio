# Architektura VidEdit Studio

VidEdit Studio jest lokalną aplikacją desktopową opartą o Electron, React i TypeScript. Pierwszy etap tworzy bezpieczny fundament projektu, bez funkcji montażowych.

## Główne warstwy

### `aplikacja`

Warstwa startowa UI. Zawiera wejście Reacta, ekran aplikacji i style. Komponenty prezentują dane oraz wywołują funkcje z modułów lub domeny.

### `domena`

Czysta logika aplikacji: typy, model projektu, model czasu, walidacja i proste przeliczenia. Kod domenowy nie zna Reacta, Electrona, systemu plików ani FFmpeg.

### `infrastruktura`

Miejsce na integracje z narzędziami zewnętrznymi: Electron, system plików, zapis projektu i lokalny FFmpeg. W tym etapie istnieją tylko porty, tymczasowy adapter FFmpeg oraz port pod przyszły wybór pliku wideo.

### `moduly`

Grupowanie funkcji według obszarów aplikacji: projekt, media, audio, cisza, timeline, eksport, ustawienia i logi. Moduły łączą UI z domeną oraz infrastrukturą, ale nie powinny mieszać odpowiedzialności.

### `wspolne`

Wspólne typy, stałe i proste pomocniki używane przez różne warstwy.

## Dlaczego oddzielamy UI od domeny

UI zmienia się szybciej niż reguły domenowe. Oddzielenie domeny pozwala testować model projektu, czas i walidację bez uruchamiania Reacta ani Electrona. Dzięki temu przyszłe funkcje, takie jak wykrywanie ciszy lub eksport, mogą być rozwijane etapami.

## Import mediów

Pierwszy moduł importu mediów działa wyłącznie na danych wejściowych przekazanych do domeny. Waliduje nazwę pliku, ścieżkę, rozszerzenie wideo, opcjonalny czas trwania i opcjonalny rozmiar pliku.

W tym etapie import nie otwiera okna wyboru pliku, nie czyta dysku, nie używa Electron API, `fs`, FFmpeg ani FFprobe. Warstwa infrastruktury zawiera tylko port `PortWyboruPliku`, który zostanie użyty przy późniejszej implementacji adaptera desktopowego.

## Czego nie wolno mieszać

- Komponenty React nie wywołują bezpośrednio FFmpeg.
- Komponenty React nie zawierają logiki wykrywania ciszy, eksportu ani odczytu plików.
- Domeny nie wolno uzależniać od Reacta, Electrona ani systemu plików.
- Infrastruktura nie powinna definiować reguł biznesowych projektu.
- Moduły nie powinny tworzyć globalnych abstrakcji bez konkretnej potrzeby.
