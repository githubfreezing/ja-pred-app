// src/components/ForecastLineChart.tsx
import { LineChart } from "@mui/x-charts/LineChart";

type Props = {
  horizon: number[];
  labels: string[];
  values: number[];
  height?: number;
};

export default function ForecastLineChart({
  horizon,
  labels,
  values,
  height = 260,
}: Props) {

  // 🔵 実績（horizon === 0）
  const actualSeries = values.map((v, idx) =>
    horizon[idx] === 0 ? v : null
  );

  // 🔴 予測（horizon !== 0）
  const forecastSeries = values.map((v, idx) =>
    horizon[idx] !== 0 ? v : null
  );

  return (
    <LineChart
      height={height}
      xAxis={[
        {
          data: labels,
          scaleType: "point",
        },
      ]}
      yAxis={[
        {
          label: "kg",
          valueFormatter: (v) => `${v / 1000}k`,
          tickNumber: 6,
        }
      ]}
      series={[
        {
          data: actualSeries,
          label: "実績",
          color: "#1976d2", // MUI primary blue
        },
        {
          data: forecastSeries,
          label: "予測",
          color: "#d32f2f", // MUI error red
        },
      ]}
    />
  );
}