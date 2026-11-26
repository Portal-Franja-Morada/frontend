export const FETCH_TIMEOUT_MS = 10_000;
export const DEFAULT_NEWS_IMAGE = "/news-default.png";
export const ADMIN_LIST_FETCH_LIMIT = 50;
export const ADMIN_POSTS_PAGE_LIMIT = 5;
export const ADMIN_EVENTS_PAGE_LIMIT = 5;
export const SEARCH_DEBOUNCE_MS = 300;

export function getLandingSiteUrl(): string {
  const raw = import.meta.env.VITE_LANDING_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return "http://localhost:4321";
  }
  return "/";
}
