# ADR 0003: Lokalny most HTTP dla FFmpeg

## Status

Zaakceptowana

## Kontekst

VidEdit Studio dziala jako lokalna aplikacja webowa uruchamiana przez Vite w przegladarce. UI moze korzystac z przegladarkowego modelu `File`, ale nie moze bezposrednio uruchamiac lokalnych procesow ani uzywac `node:child_process`.

Istniejaca infrastruktura FFmpeg/FFprobe jest kodem Node i uruchamia lokalne binarki przez proces systemowy. Tego kodu nie da sie podpiac bezposrednio do runtime Vite/browser bez dodatkowego adaptera poza przegladarka.

## Decyzja

Na potrzeby MVP uzywamy malego lokalnego procesu HTTP uruchamianego obok Vite. Proces ten bedzie waskim mostem miedzy webowym UI a lokalnym FFmpeg/FFprobe.

Zakres mostu na start obejmuje:

- diagnostyke FFmpeg/FFprobe,
- przyjecie pliku lub danych pliku z UI,
- utworzenie roboczej kopii pliku,
- wyodrebnienie audio do WAV,
- zwrocenie statusu i sciezki wynikowej.

## Poza zakresem

W tej decyzji nie implementujemy jeszcze:

- eksportu,
- wykrywania ciszy,
- kolejki zadan,
- instalatora,
- autoaktualizacji,
- Electron API.

## Konsekwencje

- UI pozostaje webowe i nie wywoluje bezposrednio FFmpeg ani Node API.
- Kod FFmpeg pozostaje po stronie lokalnego procesu Node.
- Most HTTP powinien byc minimalny i dopasowany do pierwszego przeplywu audio, bez budowania globalnej warstwy integracji na przyszlosc.
- Powrot do Electron API nadal wymaga osobnej decyzji ADR.