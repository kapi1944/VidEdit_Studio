import { createServer } from 'node:http';

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

const serwer = createServer((zadanie, odpowiedz) => {
  const adres = new URL(zadanie.url ?? '/', `http://${zadanie.headers.host ?? '127.0.0.1'}`);

  if (zadanie.method === 'GET' && adres.pathname === '/health') {
    wyslijJson(odpowiedz, 200, { status: 'ok', nazwa: nazwaMostu });
    return;
  }

  wyslijJson(odpowiedz, 404, { status: 'blad', komunikat: 'Nie znaleziono sciezki' });
});

serwer.listen(portMostu, '127.0.0.1', () => {
  console.log(`${nazwaMostu} dziala na http://127.0.0.1:${portMostu}`);
});
