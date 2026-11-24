import type { HomeResponse } from "../types/content";
import { FETCH_TIMEOUT_MS } from "./constants";

function isHomeResponse(data: unknown): data is HomeResponse {
  if (!data || typeof data !== "object") {
    return false;
  }

  const record = data as Record<string, unknown>;
  return Array.isArray(record.novedades) && Array.isArray(record.eventos);
}

export function getApiBaseUrl(): string | null {
  const raw = import.meta.env.PUBLIC_API_URL?.trim();
  if (!raw) {
    return null;
  }
  return raw.replace(/\/$/, "");
}

export async function fetchPublicHome(baseUrl: string): Promise<HomeResponse> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/public/home`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: unknown = await response.json();
    if (!isHomeResponse(data)) {
      throw new Error("Respuesta inválida");
    }

    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}
