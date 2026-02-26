import React from "react";
import { Box, TextField, Button } from "@mui/material";

type Props = {
  fromDate: string;
  setFromDate: (value: string) => void;
  onSubmit: () => void;
};

const DateInputForm: React.FC<Props> = ({ fromDate, setFromDate, onSubmit }) => {
  return (
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
        label="開始日"
        size="small"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        sx={{ width: 170 }}
      />

      <Button
        variant="contained"
        onClick={onSubmit}
        sx={{
          height: 40,
          minWidth: 90,
          color: "#fff",
          borderColor: "#8F4E45",
          backgroundColor: "#8F4E45",
        }}
      >
        決定
      </Button>
    </Box>
  );
};

export default DateInputForm;