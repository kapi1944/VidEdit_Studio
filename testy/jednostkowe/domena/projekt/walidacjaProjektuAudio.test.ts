import { describe, expect, it } from "vitest";

import type {
  DaneAudioProjektu,
  SciezkaAudio
} from "../../../../src/domena/audio/typyAudio";
import { DOMYSLNE_USTAWIENIA_WYKRYWANIA_CISZY } from "../../../../src/moduly/cisza/indeksCiszy";
import { utworzPustyProjekt } from "../../../../src/domena/projekt/fabrykaProjektu";
import {
  sprawdzCzyProjektJestPoprawny,
  walidujDaneAudioProjektu
} from "../../../../src/domena/projekt/walidacjaProjektu";

function utworzSciezkeAudio(
  nadpisaneDane: Partial<SciezkaAudio> = {}
): SciezkaAudio {
  return {
    id: "audio-1",
    sciezkaPlikuZrodlowego: "C:\\filmy\\nagranie.mp4",
    sciezkaPlikuAudio: "C:\\roboczy\\audio-1.wav",
    czasTrwaniaMs: 120000,
    format: "wav",
    liczbaKanalow: 1,
    probkowanieHz: 16000,
    ...nadpisaneDane
  };
}

describe("projekt montazu z danymi audio", () => {
  it("akceptuje nowy projekt bez wyodrebnionego audio", () => {
    const projekt = utworzPustyProjekt("Projekt bez audio");

    expect(projekt.audio).toEqual({
      statusAnalizyAudio: "brak",
      ustawieniaWykrywaniaCiszy: DOMYSLNE_USTAWIENIA_WYKRYWANIA_CISZY,
      segmentyCiszy: []
    });
    expect(sprawdzCzyProjektJestPoprawny(projekt)).toEqual([]);
  });

  it("akceptuje projekt z poprawna sciezka audio", () => {
    const daneAudio: DaneAudioProjektu = {
      statusAnalizyAudio: "ukonczona",
      sciezkaAudio: utworzSciezkeAudio(),
      segmentyCiszy: []
    };
    const projekt = {
      ...utworzPustyProjekt("Projekt z audio"),
      audio: daneAudio
    };

    expect(sprawdzCzyProjektJestPoprawny(projekt)).toEqual([]);
  });

  it("odrzuca ukonczona analize bez sciezki audio", () => {
    const daneAudio: DaneAudioProjektu = {
      statusAnalizyAudio: "ukonczona",
      segmentyCiszy: []
    };
    const projekt = {
      ...utworzPustyProjekt("Projekt z bledem audio"),
      audio: daneAudio
    };

    const bledy = sprawdzCzyProjektJestPoprawny(projekt);

    expect(bledy).toContainEqual(
      expect.objectContaining({ pole: "audio.sciezkaAudio" })
    );
  });

  it("odrzuca status blad bez komunikatu bledu", () => {
    const daneAudio: DaneAudioProjektu = {
      statusAnalizyAudio: "blad",
      segmentyCiszy: []
    };
    const projekt = {
      ...utworzPustyProjekt("Projekt z bledem audio"),
      audio: daneAudio
    };

    const bledy = sprawdzCzyProjektJestPoprawny(projekt);

    expect(bledy).toContainEqual(
      expect.objectContaining({ pole: "audio.ostatniBladAudio" })
    );
  });

  it("odrzuca nieznany status analizy audio", () => {
    const daneAudio = {
      statusAnalizyAudio: "nieznany_status",
      segmentyCiszy: []
    } as unknown as DaneAudioProjektu;

    const bledy = walidujDaneAudioProjektu(daneAudio);

    expect(bledy).toContainEqual(
      expect.objectContaining({ pole: "statusAnalizyAudio" })
    );
  });

  it("akceptuje pusta tablice segmentow ciszy", () => {
    const daneAudio: DaneAudioProjektu = {
      statusAnalizyAudio: "brak",
      segmentyCiszy: []
    };

    expect(walidujDaneAudioProjektu(daneAudio)).toEqual([]);
  });

  it("odrzuca ustawienia wykrywania ciszy spoza zakresu", () => {
    const daneAudio: DaneAudioProjektu = {
      statusAnalizyAudio: "brak",
      ustawieniaWykrywaniaCiszy: {
        ...DOMYSLNE_USTAWIENIA_WYKRYWANIA_CISZY,
        progCiszyDb: -90
      },
      segmentyCiszy: []
    };

    expect(walidujDaneAudioProjektu(daneAudio)).toContainEqual(
      expect.objectContaining({
        pole: "ustawieniaWykrywaniaCiszy.progCiszyDb"
      })
    );
  });

  it("odrzuca bledna sciezke audio w projekcie", () => {
    const daneAudio: DaneAudioProjektu = {
      statusAnalizyAudio: "ukonczona",
      sciezkaAudio: utworzSciezkeAudio({ czasTrwaniaMs: 0 }),
      segmentyCiszy: []
    };
    const projekt = {
      ...utworzPustyProjekt("Projekt z bledna sciezka audio"),
      audio: daneAudio
    };

    const bledy = sprawdzCzyProjektJestPoprawny(projekt);

    expect(bledy).toContainEqual(
      expect.objectContaining({ pole: "audio.sciezkaAudio.czasTrwaniaMs" })
    );
  });
});
