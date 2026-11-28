import type { PublicPostDetail } from "../types/content";
import { FETCH_TIMEOUT_MS } from "./constants";
import { getApiBaseUrl } from "./fetch-home";

export class PostNotFoundError extends Error {
  constructor() {
    super("Post not found");
    this.name = "PostNotFoundError";
  }
}

function isPublicPostDetail(data: unknown): data is PublicPostDetail {
  if (!data || typeof data !== "object") {
    return false;
  }

  const record = data as Record<string, unknown>;
  return (
    typeof record.slug === "string" &&
    typeof record.titulo === "string" &&
    typeof record.resumen === "string" &&
    typeof record.publicadoAt === "string" &&
    typeof record.cuerpo === "string" &&
    (record.imagenUrl === null || typeof record.imagenUrl === "string") &&
    Array.isArray(record.galeria) &&
    record.galeria.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as Record<string, unknown>).url === "string",
    )
  );
}

export async function fetchPublicPost(
  baseUrl: string,
  slug: string,
): Promise<PublicPostDetail> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const encodedSlug = encodeURIComponent(slug);
    const response = await fetch(`${baseUrl}/public/posts/${encodedSlug}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (response.status === 404) {
      throw new PostNotFoundError();
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: unknown = await response.json();
    if (!isPublicPostDetail(data)) {
      throw new Error("Respuesta inválida");
    }

    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}

export { getApiBaseUrl };
