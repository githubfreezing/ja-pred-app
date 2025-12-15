// /src/pages/PastDataPage.tsx
import * as React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

import { LineChart } from "@mui/x-charts/LineChart";

type PastDataRow = {
  date: string;   // yyyy-mm-dd
  quantity: number;
};

type PastDataResponse = {
  from: string;
  to: string;
  rows: PastDataRow[];
};

const PastDataPage: React.FC = () => {
  const [fromDate, setFromDate] = React.useState<string>("");
  const [toDate, setToDate] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<PastDataResponse | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // 例: http://localhost:8000

  const validate = (from: string, to: string) => {
    if (!from || !to) return "開始日と終了日を入力してください。";
    if (from > to) return "開始日は終了日以前の日付を選択してください。";
    return "";
  };

  const handleDecide = async () => {
    const msg = validate(fromDate, toDate);
    setError(msg);
    if (msg) return;

    setLoading(true);
    setData(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/pastdata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_date: fromDate, to_date: toDate }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error: ${res.status} ${text}`);
      }

      const json = (await res.json()) as PastDataResponse;
      setData(json);
    } catch (e: any) {
      setError(e?.message ?? "API呼び出しに失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      {/* 中央のコンテンツ枠 */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 900,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ textAlign: "center" }}>
          過去データ期間の指定
        </Typography>

        {/* フォーム＋ボタン（中央寄せ） */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            type="date"
            value={fromDate}
            onChange={(e) => {
              const v = e.target.value;
              setFromDate(v);
              setError(validate(v, toDate));
            }}
            sx={{ width: 170 }}
            inputProps={{ "aria-label": "開始日" }}
          />

          <Typography sx={{ userSelect: "none" }}>〜</Typography>

          <TextField
            size="small"
            type="date"
            value={toDate}
            onChange={(e) => {
              const v = e.target.value;
              setToDate(v);
              setError(validate(fromDate, v));
            }}
            sx={{ width: 170 }}
            inputProps={{ "aria-label": "終了日" }}
          />

          <Button
            variant="contained"
            onClick={handleDecide}
            disabled={loading}
            sx={{ height: 40, minWidth: 90 }}
          >
            {loading ? "取得中…" : "決定"}
          </Button>
        </Box>

        {/* エラーも中央に */}
        {error && (
          <Typography color="error" sx={{ textAlign: "center" }}>
            {error}
          </Typography>
        )}

        {/* グラフ（中央・固定幅） */}
        {data && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              mt: 1,
            }}
          >
            <Typography sx={{ textAlign: "center" }}>
              取得期間：{data.from} 〜 {data.to}
            </Typography>

            <Box sx={{ width: "100%", maxWidth: 720 }}>
              <LineChart
                xAxis={[
                  {
                    scaleType: "point",
                    data: data.rows.map((r) => r.date),
                    label: "日付",
                  },
                ]}
                series={[
                  {
                    data: data.rows.map((r) => r.quantity),
                    label: "quantity",
                  },
                ]}
                height={320}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PastDataPage;