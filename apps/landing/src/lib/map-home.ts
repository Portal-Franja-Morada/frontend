import type { HomeResponse } from "../types/content";
import type { HomeViewModel } from "../types/view";
import { HOME_PREVIEW_LIMIT } from "./constants";
import { mapPublicEventToAgendaEvent } from "./map-event";
import { mapPublicPostToNewsItem } from "./map-post";

export function mapHomeResponse(data: HomeResponse): HomeViewModel {
  return {
    events: data.eventos.slice(0, HOME_PREVIEW_LIMIT).map(mapEvent),
    news: data.novedades.slice(0, HOME_PREVIEW_LIMIT).map(mapPost),
  };
}

function mapEvent(event: HomeResponse["eventos"][number]) {
  return mapPublicEventToAgendaEvent(event);
}

function mapPost(post: HomeResponse["novedades"][number]) {
  return mapPublicPostToNewsItem(post);
}
