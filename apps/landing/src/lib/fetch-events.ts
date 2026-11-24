import type { PublicEventsPage } from "../types/content";
import { EVENTS_PAGE_LIMIT, FETCH_TIMEOUT_MS } from "./constants";
import { getApiBaseUrl } from "./fetch-home";

function isPublicEventsPage(data: unknown): data is PublicEventsPage {
  if (!data || typeof data !== "object") {
    return false;
  }

  const record = data as Record<string, unknown>;
  return (
    Array.isArray(record.items) &&
    typeof record.page === "number" &&
    typeof record.total === "number"
  );
}

export async function fetchPublicEvents(
  baseUrl: string,
  page: number,
): Promise<PublicEventsPage> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const url = new URL(`${baseUrl}/public/events`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(EVENTS_PAGE_LIMIT));

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: unknown = await response.json();
    if (!isPublicEventsPage(data)) {
      throw new Error("Respuesta inválida");
    }

    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}

export { getApiBaseUrl };
