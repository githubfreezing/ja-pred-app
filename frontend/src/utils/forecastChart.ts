// src/utils/forecastChart.ts
import type { ForecastRow } from "../types/forecast";

export function buildForecastChartData(rows: ForecastRow[]) {

  // const horizon = rows.map((r) =>
  //   typeof r?.horizon_days === "number" ? r.horizon_days : 0
  // );
  const horizon = rows.map((r) => {
    // あり得るキーを順に拾う（必要に応じて追加/削除）
    const raw =
      (r as any)?.horizon_days ??
      (r as any)?.horizonDays ??
      (r as any)?.horizon ??
      0;

    return typeof raw === "number" ? raw : Number(raw ?? 0);
  });

  const labels = rows.map((r, idx) => {
    if (!r?.target_date) return `Day ${idx + 1}`;
    const d = new Date(r.target_date);
    return d.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
  });

  const values = rows.map((r) =>
    typeof r?.forecast_kg === "number" ? r.forecast_kg : Number(r?.forecast_kg ?? 0)
  );

  return { horizon, labels, values };
}