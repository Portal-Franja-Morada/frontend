import type { PublicPostsPage } from "../types/content";
import { FETCH_TIMEOUT_MS, POSTS_PAGE_LIMIT } from "./constants";
import { getApiBaseUrl } from "./fetch-home";

function isPublicPostsPage(data: unknown): data is PublicPostsPage {
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

export async function fetchPublicPosts(
  baseUrl: string,
  page: number,
): Promise<PublicPostsPage> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const url = new URL(`${baseUrl}/public/posts`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(POSTS_PAGE_LIMIT));

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: unknown = await response.json();
    if (!isPublicPostsPage(data)) {
      throw new Error("Respuesta inválida");
    }

    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}

export { getApiBaseUrl };
