type WlasciwosciPaskaKlipu = {
  czasTrwaniaMs: number;
  formatujCzas: (czasMs: number) => string;
};

export function Pasek_Klipu({
  czasTrwaniaMs,
  formatujCzas
}: WlasciwosciPaskaKlipu) {
  const etykietaCzasu =
    czasTrwaniaMs > 0 ? formatujCzas(czasTrwaniaMs) : "brak czasu";

  return (
    <div
      className="pasek-klipu"
      aria-label={`Klip wideo, dlugosc ${etykietaCzasu}`}
    >
      <span className="pasek-klipu__nazwa">Klip wideo</span>
      <span className="pasek-klipu__czas">{etykietaCzasu}</span>
    </div>
  );
}
