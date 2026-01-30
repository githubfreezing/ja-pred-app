// src/pages/PastDataPage.tsx
import * as React from "react";
import { Box, Typography, Paper } from "@mui/material";

import DateRangeForm from "../components/DateRangeForm";
import PastDataChart from "../components/PastDataChart";
import { usePastData } from "../hooks/usePastData";

const PastDataPage: React.FC = () => {
  const [fromDate, setFromDate] = React.useState<string>("");
  const [toDate, setToDate] = React.useState<string>("");

  const { loading, data, error, fetchByRange, setError } = usePastData();

  const handleDecide = React.useCallback(() => {
    fetchByRange(fromDate, toDate);
  }, [fetchByRange, fromDate, toDate]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
      <Box 
       sx={{ 
        width: "100%", 
        maxWidth: 900, 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        gap: 2 
        }}
      >
        <Paper
          elevation={2}
          sx={{
            width: "100%",
            maxWidth: 900,
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            backgroundColor: "#FBF8F6",
            backdropFilter: "blur(2px)",
            borderRadius: 5,
          }}
        >

          <Typography variant="h6" sx={{ textAlign: "center" }}>
            過去データ期間の指定
          </Typography>

          <DateRangeForm
            fromDate={fromDate}
            toDate={toDate}
            onChangeFrom={setFromDate}
            onChangeTo={setToDate}
            onSubmit={handleDecide}
            loading={loading}
            onErrorChange={setError}
          />

        </Paper>

          {error && (
            <Typography color="error" sx={{ textAlign: "center" }}>
              {error}
            </Typography>
          )}

          {data && 
            <Paper
              elevation={2}
              sx={{
                width: "100%",
                maxWidth: 900,
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                backgroundColor: "#FBF8F6",
                backdropFilter: "blur(2px)",
                borderRadius: 5,
              }}
            >
              <PastDataChart data={data} />
            </Paper>
          }

      </Box>
    </Box>
  );
};

export default PastDataPage;