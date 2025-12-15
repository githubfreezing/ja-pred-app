// src/components/ApiTestPanel.tsx
import * as React from "react";
import Button from "@mui/material/Button";
import { useRootApi } from "../hooks/useRootApi";

export const ApiTestPanel: React.FC = () => {
  const { result, loading, error, callApi } = useRootApi();

  return (
    <div style={{ padding: "20px" }}>
      <Button variant="contained" onClick={callApi} disabled={loading}>
        {loading ? "Loading..." : "Hello MUI ＋ Fetch"}
      </Button>

      <div style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
        <strong>API response:</strong>
        <br />
        {error && <div style={{ color: "red" }}>{error}</div>}
        {!error && result}
      </div>
    </div>
  );
};