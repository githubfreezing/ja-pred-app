// src/components/PredDataChart.tsx
import * as React from "react";
import { Box, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";

type Props = {
  chartData: unknown | null; // 表示有無の判定に使うだけなら unknown でOK（必要なら型に変更してください）
  xLabels: string[];
  actualSeries: Array<number | null>;
  predSeries: Array<number | null>;
};

const PredDataChart: React.FC<Props> = ({ chartData, xLabels, actualSeries, predSeries }) => {
  return (
    <Box sx={{ width: "100%", maxWidth: 720 }}>
      {!chartData ? (
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          開始日を選んで「決定」を押すとグラフが表示されます
        </Typography>
      ) : (
        <LineChart
          height={360}
          xAxis={[
            {
              scaleType: "point",
              data: xLabels,
              label: "日付",
            },
          ]}
          series={[
            {
              data: actualSeries,
              label: "出荷量（実績）",
            },
            {
              data: predSeries,
              label: "出荷量（予測）",
            },
          ]}
        />
      )}
    </Box>
  );
};

export default PredDataChart;