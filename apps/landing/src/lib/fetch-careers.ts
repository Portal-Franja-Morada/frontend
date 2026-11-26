import type { CareersResponse } from "../types/curriculum";
import { FETCH_TIMEOUT_MS } from "./constants";

export { getApiBaseUrl } from "./fetch-home";

function isCareersResponse(data: unknown): data is CareersResponse {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  return Array.isArray(record.items);
}

export async function fetchPublicCareers(
  baseUrl: string,
): Promise<CareersResponse> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/public/careers`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: unknown = await response.json();
    if (!isCareersResponse(data)) {
      throw new Error("Respuesta inválida");
    }

    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}
