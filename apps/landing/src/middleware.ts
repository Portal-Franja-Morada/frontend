import { defineMiddleware } from "astro:middleware";
import { DETAIL_SHELL_SLUG } from "./lib/constants";

export const onRequest = defineMiddleware((context, next) => {
  const match = /^\/novedades\/([^/]+)\/?$/.exec(context.url.pathname);
  if (match && match[1] !== DETAIL_SHELL_SLUG) {
    const url = new URL(context.url);
    url.pathname = `/novedades/${DETAIL_SHELL_SLUG}`;
    return context.rewrite(url);
  }

  return next();
});
