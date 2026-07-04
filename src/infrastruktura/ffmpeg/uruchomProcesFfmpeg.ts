import { spawn } from "node:child_process";

import type { UruchomProcesFfmpeg } from "./typyFfmpeg";

export const uruchomProcesFfmpeg: UruchomProcesFfmpeg = (
  polecenie,
  argumenty
) =>
  new Promise((resolve, reject) => {
    const proces = spawn(polecenie, argumenty, {
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";

    proces.stdout.on("data", (dane: Buffer | string) => {
      stdout += dane.toString();
    });

    proces.stderr.on("data", (dane: Buffer | string) => {
      stderr += dane.toString();
    });

    proces.on("error", (blad) => {
      reject(blad);
    });

    proces.on("close", (kodWyjscia) => {
      resolve({
        kodWyjscia: kodWyjscia ?? 1,
        stdout,
        stderr
      });
    });
  });
