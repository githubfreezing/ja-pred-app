// src/api/client.ts
import { API_BASE_URL } from "../config/api";

export async function fetchRootApi() {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not defined");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}