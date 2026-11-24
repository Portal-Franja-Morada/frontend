import type { PublicEventDetail } from "../types/content";
import { FETCH_TIMEOUT_MS } from "./constants";
import { getApiBaseUrl } from "./fetch-home";

export class EventNotFoundError extends Error {
  constructor() {
    super("Event not found");
    this.name = "EventNotFoundError";
  }
}

function isPublicEventDetail(data: unknown): data is PublicEventDetail {
  if (!data || typeof data !== "object") {
    return false;
  }

  const record = data as Record<string, unknown>;
  return (
    typeof record.slug === "string" &&
    typeof record.titulo === "string" &&
    typeof record.descripcion === "string" &&
    typeof record.lugar === "string" &&
    typeof record.inicio === "string" &&
    typeof record.publicadoAt === "string" &&
    typeof record.googleCalendarUrl === "string" &&
    (record.fin === null || typeof record.fin === "string") &&
    (record.imagenUrl === null || typeof record.imagenUrl === "string")
  );
}

export async function fetchPublicEvent(
  baseUrl: string,
  slug: string,
): Promise<PublicEventDetail> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const encodedSlug = encodeURIComponent(slug);
    const response = await fetch(`${baseUrl}/public/events/${encodedSlug}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (response.status === 404) {
      throw new EventNotFoundError();
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: unknown = await response.json();
    if (!isPublicEventDetail(data)) {
      throw new Error("Respuesta inválida");
    }

    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}

export { getApiBaseUrl };
