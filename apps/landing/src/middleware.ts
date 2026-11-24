import { defineMiddleware } from "astro:middleware";
import { DETAIL_SHELL_SLUG } from "./lib/constants";

function rewriteDetailPath(
  context: Parameters<Parameters<typeof defineMiddleware>[0]>[0],
  section: string,
) {
  const match = new RegExp(`^/${section}/([^/]+)/?$`).exec(
    context.url.pathname,
  );
  if (match && match[1] !== DETAIL_SHELL_SLUG) {
    const url = new URL(context.url);
    url.pathname = `/${section}/${DETAIL_SHELL_SLUG}`;
    return context.rewrite(url);
  }

  return null;
}

export const onRequest = defineMiddleware((context, next) => {
  const novedadesRewrite = rewriteDetailPath(context, "novedades");
  if (novedadesRewrite) {
    return novedadesRewrite;
  }

  const eventosRewrite = rewriteDetailPath(context, "eventos");
  if (eventosRewrite) {
    return eventosRewrite;
  }

  return next();
});
