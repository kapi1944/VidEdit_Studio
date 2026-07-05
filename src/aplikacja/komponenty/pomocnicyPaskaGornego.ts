import type { StatusImportuMediow } from "../../moduly/media/komponenty/Panel_Importu_Mediow";

export type StatusProjektuUi =
  | "gotowe"
  | "projekt_roboczy"
  | "trwa_operacja"
  | "blad"
  | "brak_mediow";

type DaneStatusuProjektuUi = {
  liczbaMediow: number;
  statusImportuMediow: StatusImportuMediow;
};

type DaneEksportuUi = {
  liczbaMediow: number;
  czyRealnyEksportDostepny?: boolean;
};

export const tytulPlaceholderaHistorii =
  "Historia operacji zostanie dodana w późniejszym etapie.";

export const tytulPlaceholderaEksportu =
  "Eksport nie jest dostepny w tym etapie MVP.";

const etykietyStatusuProjektuUi: Record<StatusProjektuUi, string> = {
  gotowe: "Gotowe",
  projekt_roboczy: "Projekt roboczy",
  trwa_operacja: "Trwa operacja",
  blad: "Błąd",
  brak_mediow: "Brak mediow"
};

export function okreslStatusProjektuUi({
  liczbaMediow,
  statusImportuMediow
}: DaneStatusuProjektuUi): StatusProjektuUi {
  if (statusImportuMediow === "blad") {
    return "blad";
  }

  if (
    statusImportuMediow === "wybieranie" ||
    statusImportuMediow === "odczyt_metadanych"
  ) {
    return "trwa_operacja";
  }

  if (liczbaMediow <= 0) {
    return "brak_mediow";
  }

  return "gotowe";
}

export function pobierzEtykieteStatusuProjektuUi(status: StatusProjektuUi) {
  return etykietyStatusuProjektuUi[status];
}

export function czyEksportDostepnyWUi({
  liczbaMediow,
  czyRealnyEksportDostepny = false
}: DaneEksportuUi) {
  return czyRealnyEksportDostepny && liczbaMediow > 0;
}

export function czyHistoriaDostepnaWUi(czyHistoriaOperacjiDostepna = false) {
  return czyHistoriaOperacjiDostepna;
}
