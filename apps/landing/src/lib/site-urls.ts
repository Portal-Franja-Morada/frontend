/** URL de la app estudiantil (web). */
export function getWebAppUrl(): string {
  const raw = import.meta.env.PUBLIC_WEB_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return "http://localhost:5174";
  }
  return "/";
}

/** URL del panel de administración. */
export function getAdminAppUrl(): string {
  const raw = import.meta.env.PUBLIC_ADMIN_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return "http://localhost:5173";
  }
  return "/";
}
