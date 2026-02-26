//src/utils/predViewModel.ts

/** ========= 型 ========= */
type LatestPredResponse = {
  id: number;
  run_date: string;
  pred_series: number[];
  created_at: string;
};

type ForecastRow = {
  target_date?: string;
  horizon_days?: number;
  forecast_kg?: number;
};

/** ========= 共通ユーティリティ ========= */
function ymd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function buildPredViewModel(data: LatestPredResponse) {
  const run = new Date(data.run_date);

  const rows: ForecastRow[] = data.pred_series.map((kg, i) => {
    const dt = new Date(run);
    dt.setDate(dt.getDate() + (i + 1));
    return {
      target_date: ymd(dt),
      horizon_days: i + 1,
      forecast_kg: kg,
    };
  });

  const labels = rows.map((r) =>
    r.target_date ? new Date(r.target_date).toLocaleDateString("ja-JP") : ""
  );
  const horizon = rows.map((r) => r.horizon_days ?? 0);
  const values = rows.map((r) => r.forecast_kg ?? 0);

  return { rows, labels, horizon, values };
}