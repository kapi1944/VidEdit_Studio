export type ModulCiszy = {
  czyGotowy: boolean;
};

export { przetworzSegmentyCiszy } from "./przetworzSegmentyCiszy";
export {
  DOMYSLNE_USTAWIENIA_WYKRYWANIA_CISZY,
  ZAKRESY_USTAWIEN_WYKRYWANIA_CISZY,
  listaPresetowWykrywaniaCiszy,
  pobierzPresetWykrywaniaCiszy,
  rzucJesliNiepoprawneUstawieniaWykrywaniaCiszy,
  walidujUstawieniaWykrywaniaCiszy
} from "./ustawieniaCiszy";
export { wykryjCisze } from "./wykryjCisze";
export type {
  PresetWykrywaniaCiszy,
  ProbkaGlosnosciAudio,
  SurowySegmentCiszy,
  UstawieniaWykrywaniaCiszy
} from "./typyCiszy";
