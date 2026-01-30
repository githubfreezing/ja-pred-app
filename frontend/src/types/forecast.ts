// src/types/forecast.ts
export type ForecastRow = {
  target_date?: string;            // "2026-01-16" など
  forecast_kg?: number | string;   // API次第で number/文字列どちらもあり得る想定
};
