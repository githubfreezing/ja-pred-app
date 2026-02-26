// src/api/forecastApi.ts

export type LatestPredResponse = {
  id: number;
  run_date: string;
  pred_series: number[];
  created_at: string;
};

const apiBase = import.meta.env.VITE_API_BASE_URL as string;

export async function predComfirmPrediction(): Promise<LatestPredResponse> {
  const res = await fetch(`${apiBase}/api/v1/predcomfirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}