import type {
  PropozycjaCiecia,
  SegmentCiszy,
  StatusPropozycjiCiecia
} from "../../domena/timeline/typyTimeline";

function utworzIdPropozycjiCiecia(idSegmentuCiszy: string): string {
  return `propozycja-ciecia-${idSegmentuCiszy}`;
}

function utworzPropozycjeCieciaZSegmentu(
  segmentCiszy: SegmentCiszy
): PropozycjaCiecia {
  return {
    id: utworzIdPropozycjiCiecia(segmentCiszy.id),
    idSegmentuCiszy: segmentCiszy.id,
    czasPoczatkuMs: segmentCiszy.czasPoczatkuMs,
    czasKoncaMs: segmentCiszy.czasKoncaMs,
    status: "oczekuje",
    powod: "cisza",
    utworzonoAutomatycznie: true
  };
}

export function utworzPropozycjeCiecZSegmentowCiszy(
  segmentyCiszy: SegmentCiszy[]
): PropozycjaCiecia[] {
  return segmentyCiszy.map(utworzPropozycjeCieciaZSegmentu);
}

export function uzupelnijBrakujacePropozycjeCiec(
  segmentyCiszy: SegmentCiszy[],
  propozycjeCiec: PropozycjaCiecia[]
): PropozycjaCiecia[] {
  const idIstniejacychPropozycji = new Set(
    propozycjeCiec.map((propozycja) => propozycja.id)
  );
  const idSegmentowZPropozycjami = new Set(
    propozycjeCiec
      .map((propozycja) => propozycja.idSegmentuCiszy)
      .filter((idSegmentuCiszy): idSegmentuCiszy is string =>
        Boolean(idSegmentuCiszy)
      )
  );

  const brakujacePropozycje = segmentyCiszy
    .filter(
      (segmentCiszy) =>
        !idSegmentowZPropozycjami.has(segmentCiszy.id) &&
        !idIstniejacychPropozycji.has(
          utworzIdPropozycjiCiecia(segmentCiszy.id)
        )
    )
    .map(utworzPropozycjeCieciaZSegmentu);

  if (brakujacePropozycje.length === 0) {
    return propozycjeCiec;
  }

  return [...propozycjeCiec, ...brakujacePropozycje];
}

function zmienStatusPropozycjiCiecia(
  propozycjeCiec: PropozycjaCiecia[],
  idPropozycjiCiecia: string,
  status: StatusPropozycjiCiecia
): PropozycjaCiecia[] {
  let czyZmienionoPropozycje = false;

  const nowePropozycje = propozycjeCiec.map((propozycja) => {
    if (propozycja.id !== idPropozycjiCiecia) {
      return propozycja;
    }

    czyZmienionoPropozycje = true;

    return {
      ...propozycja,
      status
    };
  });

  return czyZmienionoPropozycje ? nowePropozycje : propozycjeCiec;
}

export function zatwierdzPropozycjeCiecia(
  propozycjeCiec: PropozycjaCiecia[],
  idPropozycjiCiecia: string
): PropozycjaCiecia[] {
  return zmienStatusPropozycjiCiecia(
    propozycjeCiec,
    idPropozycjiCiecia,
    "zatwierdzona"
  );
}

export function odrzucPropozycjeCiecia(
  propozycjeCiec: PropozycjaCiecia[],
  idPropozycjiCiecia: string
): PropozycjaCiecia[] {
  return zmienStatusPropozycjiCiecia(
    propozycjeCiec,
    idPropozycjiCiecia,
    "odrzucona"
  );
}

export function zatwierdzWszystkiePropozycjeCiec(
  propozycjeCiec: PropozycjaCiecia[]
): PropozycjaCiecia[] {
  return propozycjeCiec.map((propozycja) =>
    propozycja.status === "oczekuje"
      ? {
          ...propozycja,
          status: "zatwierdzona"
        }
      : propozycja
  );
}

export function cofnijDecyzjePropozycjiCiecia(
  propozycjeCiec: PropozycjaCiecia[],
  idPropozycjiCiecia: string
): PropozycjaCiecia[] {
  return zmienStatusPropozycjiCiecia(
    propozycjeCiec,
    idPropozycjiCiecia,
    "oczekuje"
  );
}
