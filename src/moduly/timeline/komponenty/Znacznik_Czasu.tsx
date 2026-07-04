import { przeliczCzasNaPozycje } from "../przeliczCzasNaPozycje";

type WlasciwosciZnacznikaCzasu = {
  czasAktualnyMs: number;
  czasTrwaniaMs: number;
  formatujCzas: (czasMs: number) => string;
};

export function Znacznik_Czasu({
  czasAktualnyMs,
  czasTrwaniaMs,
  formatujCzas
}: WlasciwosciZnacznikaCzasu) {
  const polozenieProcent = przeliczCzasNaPozycje(
    czasAktualnyMs,
    czasTrwaniaMs
  );

  return (
    <span
      className="znacznik-czasu"
      style={{ left: `${polozenieProcent}%` }}
      aria-label={`Aktualny czas ${formatujCzas(czasAktualnyMs)}`}
    />
  );
}
