// src/hooks/useRootApi.ts
import { useState } from "react";
import { fetchRootApi } from "../api/client";

export function useRootApi() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRootApi();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("API error:", e);
      setError("Error: API call failed");
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, callApi };
}