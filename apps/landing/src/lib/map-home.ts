import type { HomeResponse } from "../types/content";
import type { AgendaEvent, HomeViewModel, NewsItem } from "../types/view";
import {
  formatEventDay,
  formatEventMonth,
  formatEventTime,
  formatNewsCategory,
} from "./dates";
import { DEFAULT_NEWS_IMAGE, HOME_PREVIEW_LIMIT } from "./constants";

export function mapHomeResponse(data: HomeResponse): HomeViewModel {
  return {
    events: data.eventos.slice(0, HOME_PREVIEW_LIMIT).map(mapEvent),
    news: data.novedades.slice(0, HOME_PREVIEW_LIMIT).map(mapPost),
  };
}

function mapEvent(event: HomeResponse["eventos"][number]): AgendaEvent {
  return {
    slug: event.slug,
    day: formatEventDay(event.inicio),
    month: formatEventMonth(event.inicio),
    title: event.titulo,
    time: formatEventTime(event.inicio),
    location: event.lugar,
    href: "#",
  };
}

function mapPost(post: HomeResponse["novedades"][number]): NewsItem {
  return {
    slug: post.slug,
    category: formatNewsCategory(post.publicadoAt),
    title: post.titulo,
    image: post.imagenUrl ?? DEFAULT_NEWS_IMAGE,
    imageAlt: post.titulo,
    href: "#",
  };
}
