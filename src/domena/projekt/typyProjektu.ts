import type {
  FormatWyswietlaniaCzasu,
  LiczbaKlatekNaSekunde
} from "../czas/typyCzasu";
import type { DaneAudioProjektu } from "../audio/typyAudio";
import type { PlikMediow } from "../media/typyMediow";
import type { TimelineProjektu } from "../timeline/typyTimeline";

export type UstawieniaProjektu = {
  formatWyswietlaniaCzasu: FormatWyswietlaniaCzasu;
  liczbaKlatekNaSekunde: LiczbaKlatekNaSekunde;
};

export type ProjektMontazu = {
  id: string;
  nazwa: string;
  wersjaModelu: number;
  dataUtworzeniaIso: string;
  dataModyfikacjiIso: string;
  ustawienia: UstawieniaProjektu;
  media: PlikMediow[];
  audio: DaneAudioProjektu;
  timeline: TimelineProjektu;
};
