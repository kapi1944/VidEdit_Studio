export type WynikSprawdzeniaFfmpeg = {
  czyDostepny: boolean;
  wersja?: string;
  komunikat?: string;
};

export type PortFfmpeg = {
  sprawdzDostepnosc: () => Promise<WynikSprawdzeniaFfmpeg>;
};
