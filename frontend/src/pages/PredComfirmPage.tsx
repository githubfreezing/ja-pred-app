// src/pages/ForecastPage.tsx
import * as React from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Paper,
  Container,
  Grid,
} from "@mui/material";

import ForecastLineChart from "../components/ForecastLineChart";
import ForecastResultTable from "../components/ForecastResultTable";

import { predComfirmPrediction } from "../api/predcomfirmApi";
import { buildPredViewModel } from "../utils/predViewModel";

import type { ForecastRow } from "../types/forecast";

/** ========= 画面 ========= */
export default function ForecastPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [vm, setVm] = React.useState<{
    rows: ForecastRow[];
    labels: string[];
    horizon: number[];
    values: number[];
  } | null>(null);

  const fetchLatest = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await predComfirmPrediction();
      setVm(buildPredViewModel(data));
    } catch (e: any) {
      setError(e.message ?? "取得失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
       sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}>
      <Container maxWidth="lg" sx={{py: 3 }}>
        <Grid container spacing={3} alignItems="stretch">
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={4}>
              <Paper
                sx={{ 
                p: 2, 
                minWidth: 800, 
                height: 200, 
                flexDirection: "column",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                backgroundColor: "#FBF8F6",
                borderRadius: 5,
               }}>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
                  出荷量予測
                </Typography>

                {/* ===== 予測取得ボタン ===== */}
                <Button
                  variant="contained"
                  onClick={fetchLatest}
                  disabled={loading}
                  sx={{
                    justifyContent: "center",
                    py: 1.6,
                    color: "#FBF8F6",
                    borderColor: "#8F4E45",
                    backgroundColor: "#8F4E45"
                  }}
                >
                  {loading ? "取得中..." : "予測取得"}
                </Button>
              </Paper>
              {error && (
                <Typography color="error.main">
                  エラー: {error}
                </Typography>
              )}

              {vm && (
                <>
                <Paper sx={{
                  p: 2,
                  minWidth: 800,
                  height: 300,
                  backgroundColor: "#FBF8F6",
                  borderRadius: 5
                  }}
                >
                      <ForecastLineChart
                        labels={vm.labels}
                        horizon={vm.horizon}
                        values={vm.values}
                      />
                    </Paper>
                </>
              )}
            </Stack>
          </Grid>

          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}>
            {vm && (
              <Box>
                <Paper sx={{
                  width: "100%",
                  p: 2 ,
                  backgroundColor: "#efe8e0",
                  borderRadius: 5
                  }}
                >
                    <ForecastResultTable rows={vm.rows} />
                  </Paper>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}