import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { promisify } from 'node:util';

const uruchomPlik = promisify(execFile);
const nazwaMostu = 'lokalny-most-ffmpeg';
const portMostu = Number(process.env.PORT ?? 3217);

function wyslijJson(odpowiedz, kodStatusu, dane) {
  const tresc = JSON.stringify(dane);

  odpowiedz.writeHead(kodStatusu, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(tresc),
  });
  odpowiedz.end(tresc);
}

function pobierzPierwszaLinie(tekst) {
  return tekst
    .split(/\r?\n/)
    .map((linia) => linia.trim())
    .find(Boolean) ?? null;
}

async function sprawdzNarzedzie(nazwaNarzedzia) {
  try {
    const wynik = await uruchomPlik(nazwaNarzedzia, ['-version'], { windowsHide: true });

    return {
      czyDostepne: true,
      wersja: pobierzPierwszaLinie(`${wynik.stdout}\n${wynik.stderr}`),
      blad: null,
    };
  } catch (blad) {
    const czyBrakNarzedzia = blad?.code === 'ENOENT';
    const komunikat = czyBrakNarzedzia
      ? `Nie znaleziono narzedzia ${nazwaNarzedzia} w PATH.`
      : `Nie udalo sie uruchomic ${nazwaNarzedzia}: ${blad?.message ?? 'nieznany blad'}`;

    return {
      czyDostepne: false,
      wersja: null,
      blad: komunikat,
    };
  }
}

async function zbudujStatusFfmpeg() {
  const [ffmpeg, ffprobe] = await Promise.all([
    sprawdzNarzedzie('ffmpeg'),
    sprawdzNarzedzie('ffprobe'),
  ]);
  const bledy = [ffmpeg.blad, ffprobe.blad].filter(Boolean);

  return {
    czyFfmpegDostepny: ffmpeg.czyDostepne,
    czyFfprobeDostepny: ffprobe.czyDostepne,
    wersjaFfmpeg: ffmpeg.wersja,
    wersjaFfprobe: ffprobe.wersja,
    blad: bledy.length > 0 ? bledy.join(' ') : null,
  };
}

const serwer = createServer(async (zadanie, odpowiedz) => {
  const adres = new URL(zadanie.url ?? '/', `http://${zadanie.headers.host ?? '127.0.0.1'}`);

  if (zadanie.method === 'GET' && adres.pathname === '/health') {
    wyslijJson(odpowiedz, 200, { status: 'ok', nazwa: nazwaMostu });
    return;
  }

  if (zadanie.method === 'GET' && adres.pathname === '/api/ffmpeg/status') {
    wyslijJson(odpowiedz, 200, await zbudujStatusFfmpeg());
    return;
  }

  wyslijJson(odpowiedz, 404, { status: 'blad', komunikat: 'Nie znaleziono sciezki' });
});

serwer.listen(portMostu, '127.0.0.1', () => {
  console.log(`${nazwaMostu} dziala na http://127.0.0.1:${portMostu}`);
});
