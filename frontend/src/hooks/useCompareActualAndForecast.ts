// // src/hooks/useCompareActualAndForecast.ts



// import * as React from "react";
// import { fetchPastData, type PastDataResponse } from "../api/compareactualandforecast";
// import { validateDateRange } from "../utils/dateRangeValidation";

// export function useCompareActualAndForecast() {
//   const [loading, setLoading] = React.useState(false);
//   const [data, setData] = React.useState<PastDataResponse | null>(null);
//   const [error, setError] = React.useState<string>("");

//   const fetchByRange = React.useCallback(async (fromDate: string, toDate: string) => {
//     const msg = validateDateRange(fromDate, toDate);
//     setError(msg);
//     if (msg) return;

//     setLoading(true);
//     setData(null);

//     try {
//       const json = await fetchPastData({ from_date: fromDate, to_date: toDate });
//       console.log("json#######################",json)
//       setData(json);
//     } catch (e: any) {
//       setError(e?.message ?? "API呼び出しに失敗しました。");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   return {
//     loading,
//     data,
//     error,
//     fetchByRange,
//     setError, // DateRangeFormで入力時バリデーションを出したい場合に使用
//   };
// }