// /src/api/pastdata.ts
export type PastDataRow = {
  date: string; // yyyy-mm-dd
  quantity: number;
};

export type PastDataResponse = {
  from: string;
  to: string;
  rows: PastDataRow[];
};

export async function fetchPastData(params: {
  from_date: string;
  to_date: string;
}): Promise<PastDataResponse> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const res = await fetch(`${API_BASE_URL}/api/v1/pastdata`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error: ${res.status} ${text}`);
  }

  return (await res.json()) as PastDataResponse;
}