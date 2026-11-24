import { DETAIL_SHELL_SLUG } from "./constants";

export function parsePostSlugFromPathname(pathname: string): string | null {
  const match = /^\/novedades\/([^/]+)\/?$/.exec(pathname);
  if (!match) {
    return null;
  }

  const slug = decodeURIComponent(match[1]);
  if (!slug || slug === DETAIL_SHELL_SLUG) {
    return null;
  }

  return slug;
}
