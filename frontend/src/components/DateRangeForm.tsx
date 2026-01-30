// src/components/DateRangeForm.tsx
import * as React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { validateDateRange } from "../utils/dateRangeValidation";

type Props = {
  fromDate: string;
  toDate: string;
  onChangeFrom: (v: string) => void;
  onChangeTo: (v: string) => void;

  onSubmit: () => void;
  loading?: boolean;

  // 入力のたびにエラーを更新したい場合に外から渡す
  onErrorChange?: (msg: string) => void;
};

const DateRangeForm: React.FC<Props> = ({
  fromDate,
  toDate,
  onChangeFrom,
  onChangeTo,
  onSubmit,
  loading = false,
  onErrorChange,
}) => {
  return (
    <Box sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        flexWrap: "wrap"
      }}
    >
      <TextField
        size="small"
        type="date"
        value={fromDate}
        onChange={(e) => {
          const v = e.target.value;
          onChangeFrom(v);
          onErrorChange?.(validateDateRange(v, toDate));
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
          onChangeTo(v);
          onErrorChange?.(validateDateRange(fromDate, v));
        }}
        sx={{ width: 170 }}
        inputProps={{ "aria-label": "終了日" }}
      />

      <Button variant="contained" onClick={onSubmit} disabled={loading}
       sx={{
          height: 40,
          minWidth: 90,
          color: "#fff",
          borderColor: "#8F4E45",
          backgroundColor: "#8F4E45"
         }}
        >
        {loading ? "取得中…" : "決定"}
      </Button>
    </Box>
  );
};

export default DateRangeForm;