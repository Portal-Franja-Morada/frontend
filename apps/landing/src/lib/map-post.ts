import type { PublicPost } from "../types/content";
import type { NewsItem } from "../types/view";
import { formatNewsCategory } from "./dates";
import { DEFAULT_NEWS_IMAGE } from "./constants";

export function mapPublicPostToNewsItem(post: PublicPost): NewsItem {
  return {
    slug: post.slug,
    category: formatNewsCategory(post.publicadoAt),
    title: post.titulo,
    image: post.imagenUrl ?? DEFAULT_NEWS_IMAGE,
    imageAlt: post.titulo,
    href: `/novedades/${post.slug}`,
  };
}
