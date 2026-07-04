import type { StatusImportuMediow } from "../../moduly/media/komponenty/Panel_Importu_Mediow";

export type StatusKrokuWorkflow =
  | "gotowe"
  | "aktywny"
  | "oczekuje"
  | "blad"
  | "placeholder";

export type IdKrokuWorkflow =
  | "import-filmu"
  | "przygotowanie-audio"
  | "wykrycie-ciszy"
  | "decyzje-ciec"
  | "eksport";

export type DaneWorkflow = {
  liczbaMediow: number;
  statusImportuMediow: StatusImportuMediow;
  liczbaSegmentowCiszy: number;
  liczbaPropozycjiCiec: number;
  liczbaPropozycjiOczekujacych: number;
  liczbaPropozycjiZatwierdzonych: number;
  liczbaPropozycjiOdrzuconych: number;
};

export type KrokWorkflow = {
  id: IdKrokuWorkflow;
  nazwa: string;
  opis: string;
  status: StatusKrokuWorkflow;
};

function okreslStatusImportuFilmu({
  liczbaMediow,
  statusImportuMediow
}: Pick<DaneWorkflow, "liczbaMediow" | "statusImportuMediow">) {
  if (statusImportuMediow === "blad") {
    return "blad";
  }

  if (liczbaMediow > 0) {
    return "gotowe";
  }

  return "aktywny";
}

function okreslStatusWykryciaCiszy({
  liczbaMediow,
  liczbaSegmentowCiszy
}: Pick<DaneWorkflow, "liczbaMediow" | "liczbaSegmentowCiszy">) {
  if (liczbaSegmentowCiszy > 0) {
    return "gotowe";
  }

  if (liczbaMediow > 0) {
    return "oczekuje";
  }

  return "oczekuje";
}

function okreslStatusDecyzjiCiec({
  liczbaPropozycjiCiec,
  liczbaPropozycjiOczekujacych
}: Pick<
  DaneWorkflow,
  "liczbaPropozycjiCiec" | "liczbaPropozycjiOczekujacych"
>) {
  if (liczbaPropozycjiOczekujacych > 0) {
    return "aktywny";
  }

  if (liczbaPropozycjiCiec > 0) {
    return "gotowe";
  }

  return "oczekuje";
}

export function utworzKrokiWorkflow(daneWorkflow: DaneWorkflow): KrokWorkflow[] {
  return [
    {
      id: "import-filmu",
      nazwa: "Import filmu",
      opis:
        daneWorkflow.liczbaMediow > 0
          ? "Film jest w projekcie."
          : "Dodaj jeden plik wideo.",
      status: okreslStatusImportuFilmu(daneWorkflow)
    },
    {
      id: "przygotowanie-audio",
      nazwa: "Przygotowanie audio",
      opis: "Realne przygotowanie audio nie jest jeszcze podpięte w UI.",
      status: "placeholder"
    },
    {
      id: "wykrycie-ciszy",
      nazwa: "Wykrycie ciszy",
      opis:
        daneWorkflow.liczbaSegmentowCiszy > 0
          ? `Segmenty ciszy: ${daneWorkflow.liczbaSegmentowCiszy}.`
          : "Czeka na dane z wykrywania ciszy.",
      status: okreslStatusWykryciaCiszy(daneWorkflow)
    },
    {
      id: "decyzje-ciec",
      nazwa: "Decyzje cięć",
      opis:
        daneWorkflow.liczbaPropozycjiCiec > 0
          ? `Oczekuje: ${daneWorkflow.liczbaPropozycjiOczekujacych}, zatwierdzone: ${daneWorkflow.liczbaPropozycjiZatwierdzonych}, odrzucone: ${daneWorkflow.liczbaPropozycjiOdrzuconych}.`
          : "Brak propozycji cięć.",
      status: okreslStatusDecyzjiCiec(daneWorkflow)
    },
    {
      id: "eksport",
      nazwa: "Eksport",
      opis: "Eksport filmu pozostaje placeholderem MVP.",
      status: "placeholder"
    }
  ];
}
