export const FETCH_TIMEOUT_MS = 10_000;

export function getLandingSiteUrl(): string {
  const raw = import.meta.env.VITE_LANDING_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:4321";
  return "/";
}
