const QUERY_KEY = "cuenta";

export function readAccountDeletedBanner(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(QUERY_KEY) === "baja";
}

export function clearAccountDeletedQuery(): void {
  const url = new URL(window.location.href);
  if (url.searchParams.get(QUERY_KEY) !== "baja") return;
  url.searchParams.delete(QUERY_KEY);
  window.history.replaceState(null, "", url);
}
