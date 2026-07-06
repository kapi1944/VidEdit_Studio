# VidEdit Studio

VidEdit Studio to lokalna aplikacja webowa do prostszego montażu nagrań mówionych. MVP rozwija import mediów, analizę audio, wykrywanie ciszy, ręczne zatwierdzanie cięć i eksport.

Projekt jest teraz na etapie `porzadki-techniczne`: stabilizuje fundament developerski przed realnym importem pliku.

## Aktualny kierunek techniczny

Projekt idzie w kierunku web-first: Vite, React i TypeScript uruchamiane lokalnie w przeglądarce. Nie używamy Electrona i nie wracamy do niego bez osobnej decyzji ADR oraz testów na komputerach docelowych.

Kod aplikacji nie powinien zakładać Electron API. Import, zapis i eksport mają być projektowane jako jawne, osobne etapy zgodne z aktualną architekturą webową.

## Wymagania

- Node.js 20 lub nowszy.
- npm zgodny z używaną wersją Node.js.

## Instalacja

```bash
npm install
```

## Komendy

```bash
npm run dev
npm test
npm run test:watch
npm run typecheck
npm run build
npm run preview
```

## Obecne ograniczenia

- Brak realnego importu pliku z dysku.
- Brak integracji z FFmpeg i FFprobe.
- Brak analizy audio, wykrywania ciszy, timeline i eksportu.
- UI pokazuje fundament aplikacji oraz placeholdery przyszłych modułów.

Następny etap: `prawdziwy-import-pliku`.
