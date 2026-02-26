// src/types/compareActualAndForecast.ts
export type CompareResultRow = {
  date: string; // "2025-09-04"
  actual_quantity: number | null;
  pred_quantity: number | null;
};

export type CompareApiResponse = {
  from_date: string;
  run_date: string;
  results: CompareResultRow[];
};