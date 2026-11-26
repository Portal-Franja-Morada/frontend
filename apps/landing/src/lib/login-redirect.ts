import type { MeResponse } from "./auth-api";
import { getAdminAppUrl, getWebAppUrl } from "./site-urls";

function safeRelativeRedirect(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return null;
  }
  return raw;
}

export function resolvePostLoginUrl(me: MeResponse): string {
  if (typeof window !== "undefined") {
    const redirect = safeRelativeRedirect(
      new URLSearchParams(window.location.search).get("redirect"),
    );
    if (redirect) {
      return redirect;
    }
  }

  if (me.rol === "ADMIN") {
    return `${getAdminAppUrl()}/`;
  }

  if (!me.emailVerificado) {
    return "/verificacion";
  }

  return `${getWebAppUrl()}/perfil`;
}
