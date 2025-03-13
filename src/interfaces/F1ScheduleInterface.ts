export interface F1ScheduleInterface {
  Races: Race[];
}

export interface Race {
  round: string;
  raceName: string;
  Circuit: Circuit;
  sessions: Sessions;
}

export interface Circuit {
  circuitId: string;
  circuitName: string;
  Location: Location;
}

export interface Location {
  lat: string;
  zoom: number;
  long: string;
  locality: string;
  country: string;
  countryCode: string;
}

export interface Sessions {
  fp1: string;
  fp2?: string;
  fp3?: string;
  qualifying: string;
  gp: string;
  sprintQualifying?: string;
  sprint?: string;
}
