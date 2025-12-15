// /src/pages/PastDataPage.tsx
import * as React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const PastDataPage: React.FC = () => {
  const navigate = useNavigate();

  const [fromDate, setFromDate] = React.useState<string>("");
  const [toDate, setToDate] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  const validate = (from: string, to: string) => {
    if (!from || !to) return "開始日と終了日を入力してください。";
    // yyyy-mm-dd は文字列比較で日付順を判定できます
    if (from > to) return "開始日は終了日以前の日付を選択してください。";
    return "";
  };

  const handleDecide = () => {
    const msg = validate(fromDate, toDate);
    setError(msg);
    if (msg) return;

    // 例：検索結果ページ等に遷移（必要に応じて変更してください）
    navigate(`/past-data?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        過去データ期間の指定
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
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
          sx={{ height: 40, minWidth: 90 }}
        >
          決定
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default PastDataPage;