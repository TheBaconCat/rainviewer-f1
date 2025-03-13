export interface WeatherInterface {
  current: Current;
  current_units: CurrentUnits;
  daily: Daily;
  daily_units: DailyUnits;
  elevation: number;
  generationtime_ms: number;
  hourly: Hourly;
  hourly_units: HourlyUnits;
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
}

export interface Current {
  interval: number;
  is_day: number;
  precipitation: number;
  temperature_2m: number;
  time: number;
  weathercode: number;
  winddirection_10m: number;
  windspeed_10m: number;
}

export interface CurrentUnits {
  interval: string;
  is_day: string;
  precipitation: string;
  temperature_2m: string;
  time: string;
  weathercode: string;
  winddirection_10m: string;
  windspeed_10m: string;
}

export interface Daily {
  sunrise: number[];
  sunset: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  time: number[];
  windspeed_10m_max: number[];
}

export interface DailyUnits {
  sunrise: string;
  sunset: string;
  temperature_2m_max: string;
  temperature_2m_min: string;
  time: string;
  windspeed_10m_max: string;
}

export interface Hourly {
  precipitation: number[];
  precipitation_probability: number[];
  temperature_2m: number[];
  time: number[];
}

export interface HourlyUnits {
  precipitation: string;
  precipitation_probability: string;
  temperature_2m: string;
  time: string;
}
export interface ChartData {
  time: string;
  probability?: number;
  rainAmount?: number;
}
