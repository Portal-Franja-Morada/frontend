import { DETAIL_SHELL_SLUG } from "./constants";

function parseDetailSlug(pathname: string, section: string): string | null {
  const match = new RegExp(`^/${section}/([^/]+)/?$`).exec(pathname);
  if (!match) {
    return null;
  }

  const slug = decodeURIComponent(match[1]);
  if (!slug || slug === DETAIL_SHELL_SLUG) {
    return null;
  }

  return slug;
}

export function parsePostSlugFromPathname(pathname: string): string | null {
  return parseDetailSlug(pathname, "novedades");
}

export function parseEventSlugFromPathname(pathname: string): string | null {
  return parseDetailSlug(pathname, "eventos");
}
