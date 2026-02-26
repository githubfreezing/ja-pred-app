// src/pages/CompareActualAndForecastPage.tsx
import React from "react";
import { Box, Typography } from "@mui/material";

import type { CompareApiResponse } from "../types/compareActualAndForecast";
import { postCompareActualAndForecast } from "../api/compareactualandforecast";

import DateInputForm from "../components/DateInputForm";
import BaseCard from "../components/BaseCard";
import PredDataChart from "../components/PredDataChart";

const CompareActualAndForecastPage: React.FC = () => {
  const [fromDate, setFromDate] = React.useState<string>("");

  // ★ 取得結果を保持する state
  const [chartData, setChartData] = React.useState<CompareApiResponse | null>(null);

  // ★ 追加：ローディング＆エラー表示用
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

  const onSubmit = React.useCallback(async () => {
    if (!fromDate) {
      alert("開始日を入力してください");
      return;
    }

    if (!API_BASE_URL) {
      setError("VITE_API_BASE_URL が設定されていません（.env を確認してください）");
      setChartData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await postCompareActualAndForecast(API_BASE_URL, fromDate);
      setChartData(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("API error:", message);
      setError(message);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, fromDate]);

  // ★ LineChart 用の配列（chartData がある時だけ）
  const xLabels = React.useMemo(() => {
    if (!chartData) return [];
    return chartData.results.map((r) => r.date);
  }, [chartData]);

  const actualSeries = React.useMemo(() => {
    if (!chartData) return [];
    return chartData.results.map((r) => (r.actual_quantity ?? null));
  }, [chartData]);

  const predSeries = React.useMemo(() => {
    if (!chartData) return [];
    return chartData.results.map((r) => (r.pred_quantity ?? null));
  }, [chartData]);

  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
        maxWidth: 900,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <BaseCard>
        <Typography variant="h6" sx={{ textAlign: "center" }}>
          表示データ期間
        </Typography>

        <DateInputForm
          fromDate={fromDate}
          setFromDate={setFromDate}
          onSubmit={onSubmit}
          // ★ 追加：取得中は押せないようにする（DateInputForm側で受け取るなら）
          // loading={loading}
        />

        {/* ★ 追加：エラー表示 */}
        {error ? (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        ) : null}

        {/* ★ 追加：ローディング表示 */}
        {loading ? (
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            取得中です…
          </Typography>
        ) : null}
      </BaseCard>

      <BaseCard>
        <Typography>取得期間</Typography>

        <PredDataChart
          chartData={chartData}
          xLabels={xLabels}
          actualSeries={actualSeries}
          predSeries={predSeries}
        />
      </BaseCard>
    </Box>
  );
};

export default CompareActualAndForecastPage;

// // src/pages/CompareActualAndForecastPage.tsx
// import React from "react";
// import { Box, Typography, TextField, Button } from "@mui/material";
// import { LineChart } from "@mui/x-charts/LineChart";

// import type { CompareApiResponse } from "../types/compareActualAndForecast";
// import { postCompareActualAndForecast } from "../api/compareactualandforecast";

// import DateInputForm from "../components/DateInputForm";
// import BaseCard from "../components/BaseCard";
// import PredDataChart from "../components/PredDataChart";


// const CompareActualAndForecastPage: React.FC = () => {
//   const [fromDate, setFromDate] = React.useState<string>("");

//   // ★ 取得結果を保持する state を追加
//   const [chartData, setChartData] = React.useState<CompareApiResponse | null>(null);

//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//   const onSubmit = React.useCallback(async () => {
//     if (!fromDate) {
//       alert("開始日を入力してください");
//       return;
//     }

//     try {
//         const data = await postCompareActualAndForecast(API_BASE_URL, fromDate);
//         setChartData(data);
//     } catch (error) {
//         console.error("API error:", error);
//         setChartData(null);
//     }

//   }, [API_BASE_URL, fromDate]);

//   // ★ LineChart 用の配列を作る（chartData がある時だけ）
//   const xLabels = React.useMemo(() => {
//     if (!chartData) return [];
//     // "2025-09-04" みたいな日付をそのままラベルにする（必要なら "9/4" 表記にもできます）
//     return chartData.results.map((r) => r.date);
//   }, [chartData]);

//   const actualSeries = React.useMemo(() => {
//     if (!chartData) return [];
//     // null は 0 にしたくなければ null のままでOK（欠損として扱われます）
//     return chartData.results.map((r) => (r.actual_quantity ?? null));
//   }, [chartData]);

//   const predSeries = React.useMemo(() => {
//     if (!chartData) return [];
//     return chartData.results.map((r) => (r.pred_quantity ?? null));
//   }, [chartData]);

//   return (
//     <Box
//         sx={{
//             p: 3,
//             width: "100%",
//             maxWidth: 900,
//             mx: "auto",              // ★中央寄せ
//             display: "flex",
//             flexDirection: "column", // ★縦並び
//             alignItems: "center",
//             gap: 2,
//         }}
//     >
//         <BaseCard>
//             <Typography variant="h6" sx={{ textAlign: "center" }}>
//                 表示データ期間
//             </Typography>

//             <DateInputForm
//                 fromDate={fromDate}
//                 setFromDate={setFromDate}
//                 onSubmit={onSubmit}
//             />
//         </BaseCard>

//         <BaseCard>
//             <Typography>取得期間</Typography>

//             <PredDataChart
//                 chartData={chartData}
//                 xLabels={xLabels}
//                 actualSeries={actualSeries}
//                 predSeries={predSeries}
//             />
//         </BaseCard>
//     </Box>
//   );
// };

// export default CompareActualAndForecastPage;
