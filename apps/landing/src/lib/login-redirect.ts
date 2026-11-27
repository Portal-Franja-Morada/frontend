import type { MeResponse } from "./auth-api";
import { getAdminAppUrl, getWebAppUrl } from "./site-urls";

function safeRelativeRedirect(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return null;
  }
  return raw;
}

export function resolveAccountHomeUrl(me: MeResponse): string {
  if (me.rol === "ADMIN") {
    return `${getAdminAppUrl()}/`;
  }

  if (me.rol === "PUBLIC") {
    return "/ingresar";
  }

  if (!me.emailVerificado) {
    return "/verificacion";
  }

  return `${getWebAppUrl()}/perfil`;
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

  return resolveAccountHomeUrl(me);
}
