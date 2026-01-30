//src/components/ForecastResultTable.tsx
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import type { ForecastRow } from "../types/forecast";

type Props = {
  rows: ForecastRow[];
  title?: string;
};

function formatDateLabel(target_date?: string, idx?: number) {
  if (!target_date) return `Day ${(idx ?? 0) + 1}`;
  return new Date(target_date).toLocaleDateString("ja-JP");
}

function formatKgLabel(forecast_kg?: ForecastRow["forecast_kg"]) {
  if (typeof forecast_kg === "number") {
    return forecast_kg.toLocaleString("ja-JP", { maximumFractionDigits: 1 });
  }
  return String(forecast_kg ?? "");
}

export default function ForecastResultTable({ rows, title = "予測結果" }: Props) {
  if (!rows?.length) return null;

  return (
    // <Paper sx={{ width: "100%", p: 2 }}>
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 1.5 }} />

      <Stack spacing={1}>

        {rows.map((row, idx) => {
          const dateLabel = formatDateLabel(row?.target_date, idx);
          const kgLabel = formatKgLabel(row?.forecast_kg);

          const isActual = row?.horizon_days === 0;

          return (
            <Box
              key={`${row?.target_date ?? "day"}-${idx}`}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2">{dateLabel}</Typography>

              <Typography
               variant="body2"
               fontWeight={700}
               sx={{
                   color: isActual ? "primary.main" : "error.main",
               }}
              >
                {kgLabel} kg
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
    // </Paper>
  );
}