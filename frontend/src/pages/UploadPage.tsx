// src/pages/UploadPage.tsx
import {
  Box,
  Container,
  Stack,
  Grid,
  Paper,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import useFileUpload from "../hooks/useFileUpload";
import FilePickerButton from "../components/FilePickerButton";
import AsyncActionButton from "../components/AsyncActionButton";
import StatusAlert from "../components/StatusAlert";
import type { ForecastRow } from "../types/forecast";
import { buildForecastChartData } from "../utils/forecastChart";
import ForecastLineChart from "../components/ForecastLineChart";
import ForecastResultTable from "../components/ForecastResultTable";

export default function UploadPage() {
  const { file, setFile, isUploading, message, upload, forecast } = useFileUpload();
  const fileLabel = file ? file.name : "ファイルを選択してください";
  const rows: ForecastRow[] = Array.isArray(forecast) ? forecast : [];
  const hasForecast = rows.length > 0;
  const {
    horizon: horizonDays,
    labels: chartLabels,
    values: chartValues,
  } = buildForecastChartData(rows);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <Container maxWidth="lg" sx={{py: 3 }}>
        <Grid container spacing={3} alignItems="stretch">
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={4}>
              <Paper
               sx={{ 
                p: 2, 
                minWidth: 800, 
                height: 200, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                backgroundColor: "#FBF8F6",
                borderRadius: 5,
               }}
              >
                <Box>
                  <Stack spacing={2} alignItems="center">
                    <StatusAlert message={message} />

                    <FilePickerButton
                      label={fileLabel}
                      disabled={isUploading}
                      onPick={setFile}
                    />

                    <AsyncActionButton
                      loading={isUploading}
                      disabled={!file}
                      onClick={upload}
                      startIcon={<CloudUploadIcon />}
                    >
                      アップロード
                    </AsyncActionButton>
                  </Stack>
                </Box>
              </Paper>

              {/* グラフ */}
              {hasForecast && (
                <Paper sx={{
                  p: 2,
                  minWidth: 800,
                  height: 300,
                  backgroundColor: "#FBF8F6",
                  borderRadius: 5
                  }}
                >
                  <ForecastLineChart
                    horizon={horizonDays}
                    labels={chartLabels}
                    values={chartValues}
                  />
                </Paper>
              )}
            </Stack>
          </Grid>

          {/* 表 */}
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {hasForecast && (
              <Box>
                <Paper sx={{
                  width: "100%",
                  p: 2 ,
                  backgroundColor: "#efe8e0",
                  borderRadius: 5
                  }}
                >
                  <ForecastResultTable rows={rows} />
                </Paper>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}