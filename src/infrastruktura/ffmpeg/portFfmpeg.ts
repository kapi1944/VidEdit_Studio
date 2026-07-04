import type { WynikSprawdzeniaFfmpeg } from "./typyFfmpeg";

export type {
  UruchomProcesFfmpeg,
  WynikProcesuFfmpeg,
  WynikSprawdzeniaFfmpeg
} from "./typyFfmpeg";

export type PortFfmpeg = {
  sprawdzDostepnosc: () => Promise<WynikSprawdzeniaFfmpeg>;
};
