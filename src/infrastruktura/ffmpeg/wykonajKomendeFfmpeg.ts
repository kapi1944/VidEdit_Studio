import type { WynikProcesuFfmpeg } from "./typyFfmpeg";
import { uruchomProcesFfmpeg } from "./uruchomProcesFfmpeg";

export type WynikKomendyFfmpeg = WynikProcesuFfmpeg;

export type WykonajKomendeFfmpeg = (parametry: {
  program: string;
  argumenty: string[];
}) => Promise<WynikKomendyFfmpeg>;

export const wykonajKomendeFfmpeg: WykonajKomendeFfmpeg = ({
  program,
  argumenty
}) => uruchomProcesFfmpeg(program, argumenty);
