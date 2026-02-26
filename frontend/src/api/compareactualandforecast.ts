import type { CompareApiResponse } from "../types/compareActualAndForecast";

export async function postCompareActualAndForecast(
  apiBaseUrl: string,
  fromDate: string
): Promise<CompareApiResponse> {
  const res = await fetch(`${apiBaseUrl}/api/v1/compareactualandforecast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from_date: fromDate }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error: ${res.status} ${text}`);
  }

  return (await res.json()) as CompareApiResponse;
}
