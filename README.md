# VidEdit Studio

VidEdit Studio to prosty desktopowy edytor wideo dla twórców YouTube. MVP ma najpierw obsłużyć import jednego filmu, analizę audio, wykrywanie ciszy, ręczne zatwierdzanie cięć i eksport.

Projekt jest teraz na etapie `porzadki-techniczne`: stabilizuje fundament developerski przed realnym importem pliku.

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
