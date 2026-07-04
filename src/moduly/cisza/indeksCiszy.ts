export type ModulCiszy = {
  czyGotowy: boolean;
};

export { przetworzSegmentyCiszy } from "./przetworzSegmentyCiszy";
export {
  DOMYSLNE_USTAWIENIA_WYKRYWANIA_CISZY,
  rzucJesliNiepoprawneUstawieniaWykrywaniaCiszy,
  walidujUstawieniaWykrywaniaCiszy
} from "./ustawieniaCiszy";
export { wykryjCisze } from "./wykryjCisze";
export type {
  ProbkaGlosnosciAudio,
  SurowySegmentCiszy,
  UstawieniaWykrywaniaCiszy
} from "./typyCiszy";
