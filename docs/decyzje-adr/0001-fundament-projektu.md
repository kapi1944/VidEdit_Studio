# ADR 0001: Fundament projektu

## Status

Zaakceptowana

## Kontekst

VidEdit Studio ma być lokalną aplikacją desktopową do prostszego montażu nagrań mówionych. Pierwszy etap ma stworzyć fundament bez implementowania funkcji montażowych.

## Decyzje

- Używamy Electron + React + TypeScript.
- Czas wewnętrznie przechowujemy jako całkowite milisekundy.
- UI może pokazywać czas jako sekundy, `hh:mm:ss.mmm` albo numer klatki.
- FFmpeg będzie lokalną integracją infrastrukturalną, ale zostanie uzupełniony później.
- Pierwszy etap obejmuje strukturę, typy, walidację, prosty ekran i testy, bez importu, wykrywania ciszy, eksportu ani transkrypcji.

## Konsekwencje

Projekt od początku ma oddzieloną domenę od UI i infrastruktury. Pozwala to rozwijać kolejne funkcje bez przenoszenia logiki przetwarzania do komponentów React.
