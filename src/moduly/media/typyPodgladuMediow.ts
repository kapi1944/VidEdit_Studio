export type PodgladMedium = {
  idMedium: string;
  objectUrl: string;
  miniaturaDataUrl?: string;
  statusMiniatury?: string;
};

export type PodgladyMediow = Record<string, PodgladMedium>;

export function dodajLubZaktualizujPodgladMedium(
  podgladyMediow: PodgladyMediow,
  podgladMedium: PodgladMedium
): PodgladyMediow {
  return {
    ...podgladyMediow,
    [podgladMedium.idMedium]: podgladMedium
  };
}
