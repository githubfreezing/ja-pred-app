// src/components/BaseCard.tsx
import { Paper } from "@mui/material";
import React from "react";

export default function BaseCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
      {children}
    </Paper>
  );
}