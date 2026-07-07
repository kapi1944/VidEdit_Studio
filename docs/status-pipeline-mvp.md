# Status pipeline MVP

## Co juz jest

- `src/infrastruktura/ffmpeg` zawiera lokalny adapter uruchamiania procesow FFmpeg/FFprobe przez `node:child_process`.
- Diagnostyka sprawdza `ffmpeg -version` i `ffprobe -version`, zwraca wersje narzedzi oraz czytelne bledy braku binarki.
- `komendyAudio.ts` buduje minimalna komende wyodrebniania audio do WAV: mono, 16000 Hz.
- `src/moduly/audio` ma funkcje `wyodrebnijAudio`, ktora waliduje plik mediow i katalog roboczy, buduje komende FFmpeg oraz przyjmuje wykonawce komendy jako zaleznosc.
- Warstwa audio jest testowalna bez bezposredniego importu procesu FFmpeg, bo `wykonajKomendeFfmpeg` jest wstrzykiwane z zewnatrz.

## Co blokuje MVP

- Obecny adapter FFmpeg uzywa Node API: `node:child_process`, `spawn` i typu `Buffer`.
- Kod z `src/infrastruktura/ffmpeg/uruchomProcesFfmpeg.ts` nie moze dzialac bezposrednio w runtime Vite/browser.
- Webowe UI operuje na przegladarkowym `File` oraz URL-ach obiektowych, a `wyodrebnijAudio` wymaga trwalej sciezki pliku zrodlowego i katalogu roboczego.
- Brakuje procesu poza przegladarka, ktory przyjmie zadanie z UI, uruchomi lokalne FFmpeg/FFprobe i odda wynik do aplikacji webowej.

## Najmniejszy nastepny krok

Najmniejszy krok bez Electrona to dodac lokalny, developerski proces HTTP uruchamiany obok Vite. Ten proces powinien miec waskie endpointy do:

- sprawdzenia dostepnosci FFmpeg/FFprobe przez istniejaca diagnostyke,
- przyjecia pliku lub sciezki roboczej z UI,
- uruchomienia istniejacego `wyodrebnijAudio` przez `wykonajKomendeFfmpeg`,
- zwrocenia statusu i sciezki wygenerowanego pliku WAV.

Na tym etapie nie trzeba zmieniac UI, audio ani timeline. Wystarczy utrzymac obecny kod FFmpeg jako warstwe Node i wystawic nad nim minimalny most HTTP dla lokalnej aplikacji webowej.