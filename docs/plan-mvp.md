# Plan MVP

Docelowe MVP VidEdit Studio obejmuje:

1. Import jednego pliku wideo.
2. Wyodrębnienie audio.
3. Wykrycie ciszy.
4. Pokazanie ciszy na osi czasu.
5. Ręczne zatwierdzanie lub odrzucanie cięć.
6. Eksport przyciętego filmu.
7. Zapis projektu.
8. Testy dla kluczowej logiki domenowej.

## Aktualny etap

Obecny etap dodaje domenowy fundament importu mediów:

- listę obsługiwanych rozszerzeń wideo,
- walidację danych pliku mediów,
- fabrykę obiektu `PlikMediow`,
- port pod przyszły wybór pliku,
- placeholder UI w sekcji „Import mediów”,
- testy jednostkowe importu mediów.

Prawdziwy import z dysku nie jest jeszcze implementowany. Ten etap nie używa Electron API, `fs`, FFmpeg ani FFprobe.
