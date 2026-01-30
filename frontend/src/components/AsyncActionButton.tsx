// src/components/AsyncActionButton.tsx
import React from "react";
import { Button, CircularProgress } from "@mui/material";

type AsyncActionButtonProps = {
  loading: boolean;
  disabled?: boolean;
  onClick: () => void;
  startIcon?: React.ReactNode;
  children: React.ReactNode;
};

export default function AsyncActionButton({
  loading,
  disabled = false,
  onClick,
  startIcon,
  children,
}: AsyncActionButtonProps) {
  return (
    <Button
      variant="contained"
      size="large"
      startIcon={loading ? <CircularProgress size={18} /> : startIcon}
      onClick={onClick}
      disabled={disabled || loading}
      sx={{ py: 1.2, borderRadius: 2,
        color: "#fff",
        borderColor: "#8F4E45",
        backgroundColor: "#8F4E45"
      }}
    >
      {children}
    </Button>
  );
}