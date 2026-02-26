// src/pages/PastDataPage.tsx
import * as React from "react";
import { Box, Typography } from "@mui/material";

import DateRangeForm from "../components/DateRangeForm";
import PastDataChart from "../components/PastDataChart";
import BaseCard from "../components/BaseCard";
import { usePastData } from "../hooks/usePastData";

const PastDataPage: React.FC = () => {
  //グラフに表示する期間のはじめの日付
  const [fromDate, setFromDate] = React.useState<string>("");
  //グラフに表示する期間の最終日の日付
  const [toDate, setToDate] = React.useState<string>("");

  const { loading, data, error, fetchByRange, setError } = usePastData();

  const handleDecide = React.useCallback(() => {
    fetchByRange(fromDate, toDate);
  }, [fetchByRange, fromDate, toDate]);

  return (
    <Box
        sx={{
            p: 3,
            width: "100%",
            maxWidth: 900,
            mx: "auto",              // ★中央寄せ
            display: "flex",
            flexDirection: "column", // ★縦並び
            alignItems: "center",
            gap: 2,
        }}
    >
        <BaseCard>

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

        </BaseCard>

          {error && (
            <Typography color="error" sx={{ textAlign: "center" }}>
              {error}
            </Typography>
          )}

          {data && 
            <BaseCard>
              <PastDataChart data={data} />
            </BaseCard>
          }

      </Box>
  );
};

export default PastDataPage;