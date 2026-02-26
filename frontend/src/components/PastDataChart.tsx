// src/components/PastDataChart.tsx
import * as React from "react";
import { Box, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import type { PastDataResponse } from "../api/pastdata";

type Props = {
  data: PastDataResponse;
};

const PastDataChart: React.FC<Props> = ({ data }) => {
  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 1, mt: 1 }}>
      <Typography sx={{ textAlign: "center" }}>
        取得期間：{data.from} 〜 {data.to}
      </Typography>

      <Box sx={{ width: "100%", maxWidth: 720 }}>
        <LineChart
          xAxis={[{ scaleType: "point", data: data.rows.map((r) => r.date), label: "日付" }]}
          yAxis={[
            {
              label: "kg",
              // valueFormatter: (v) => `${v / 1000}k`,
              valueFormatter: (v: number) => `${v / 1000}k`,
              tickNumber: 6,
            }
          ]}
          series={[{ data: data.rows.map((r) => r.quantity), label: "出荷量" }]}
          height={320}
        />
      </Box>
    </Box>
  );
};

export default PastDataChart;