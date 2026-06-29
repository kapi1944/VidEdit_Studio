export type WynikSukcesu<TypDanych> = {
  czySukces: true;
  dane: TypDanych;
};

export type WynikBledu<TypBledu = string> = {
  czySukces: false;
  bledy: TypBledu[];
};

export type Wynik<TypDanych, TypBledu = string> =
  | WynikSukcesu<TypDanych>
  | WynikBledu<TypBledu>;

export function sukces<TypDanych>(dane: TypDanych): WynikSukcesu<TypDanych> {
  return {
    czySukces: true,
    dane
  };
}

export function blad<TypBledu = string>(
  bledy: TypBledu | TypBledu[]
): WynikBledu<TypBledu> {
  return {
    czySukces: false,
    bledy: Array.isArray(bledy) ? bledy : [bledy]
  };
}
