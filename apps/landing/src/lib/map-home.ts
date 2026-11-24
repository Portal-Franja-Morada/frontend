import type { HomeResponse } from "../types/content";
import type { AgendaEvent, HomeViewModel } from "../types/view";
import { formatEventDay, formatEventMonth, formatEventTime } from "./dates";
import { HOME_PREVIEW_LIMIT } from "./constants";
import { mapPublicPostToNewsItem } from "./map-post";

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

function mapPost(post: HomeResponse["novedades"][number]) {
  return mapPublicPostToNewsItem(post);
}
