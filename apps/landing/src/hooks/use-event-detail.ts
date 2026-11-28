import { useCallback, useEffect, useState } from "react";
import type { DataState } from "../lib/data-state";
import { readPreviewDataState } from "../lib/data-state";
import { DEFAULT_NEWS_IMAGE } from "../lib/constants";
import {
  EventNotFoundError,
  fetchPublicEvent,
  getApiBaseUrl,
} from "../lib/fetch-event";
import { formatEventDateLong, formatEventTimeRange } from "../lib/dates";
import { parseEventSlugFromPathname } from "../lib/post-slug";
import type { PublicEventDetail } from "../types/content";

type FetchStatus = "idle" | "loading" | "not_found" | "error" | "ok";

export type EventDetailView = {
  slug: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  gallery: string[];
  dateLabel: string;
  timeLabel: string;
  location: string;
  googleCalendarUrl: string;
};

const MISSING_API_URL_MESSAGE =
  "[@franja/landing] Falta PUBLIC_API_URL. Definila en apps/landing/.env para cargar datos del backend.";

const DOCUMENT_TITLE_SUFFIX = " | Franja Morada · Económicas";

function mapEventDetail(event: PublicEventDetail): EventDetailView {
  return {
    slug: event.slug,
    title: event.titulo,
    description: event.descripcion,
    image: event.imagenUrl ?? DEFAULT_NEWS_IMAGE,
    imageAlt: event.titulo,
    gallery: event.galeria.map((item) => item.url),
    dateLabel: formatEventDateLong(event.inicio),
    timeLabel: formatEventTimeRange(event.inicio, event.fin),
    location: event.lugar,
    googleCalendarUrl: event.googleCalendarUrl,
  };
}

function resolveDataState(
  preview: DataState | null,
  fetchStatus: FetchStatus,
): DataState {
  if (preview) {
    return preview;
  }
  if (fetchStatus === "loading") {
    return "cargando";
  }
  if (fetchStatus === "not_found") {
    return "vacio";
  }
  if (fetchStatus === "error") {
    return "error";
  }
  return "ok";
}

export function useEventDetail() {
  const previewState = readPreviewDataState();
  const slug =
    typeof window !== "undefined"
      ? parseEventSlugFromPathname(window.location.pathname)
      : null;

  const [event, setEvent] = useState<EventDetailView | null>(null);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>(() => {
    if (previewState || getApiBaseUrl()) {
      return "loading";
    }
    return "error";
  });

  const load = useCallback(async () => {
    const baseUrl = getApiBaseUrl();
    const currentSlug = parseEventSlugFromPathname(window.location.pathname);

    if (!currentSlug) {
      setEvent(null);
      setFetchStatus("not_found");
      return;
    }

    if (!baseUrl) {
      console.warn(MISSING_API_URL_MESSAGE);
      setEvent(null);
      setFetchStatus("error");
      return;
    }

    setFetchStatus("loading");
    try {
      const data = await fetchPublicEvent(baseUrl, currentSlug);
      const mapped = mapEventDetail(data);
      setEvent(mapped);
      setFetchStatus("ok");
      document.title = `${mapped.title}${DOCUMENT_TITLE_SUFFIX}`;
    } catch (error) {
      setEvent(null);
      if (error instanceof EventNotFoundError) {
        setFetchStatus("not_found");
        return;
      }
      setFetchStatus("error");
    }
  }, []);

  useEffect(() => {
    if (previewState) {
      return;
    }
    void load();
  }, [load, previewState]);

  const clearPreviewAndReload = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("estado");
    window.location.href = url.toString();
  }, []);

  const dataState = resolveDataState(previewState, fetchStatus);
  const retry = previewState === "error" ? clearPreviewAndReload : load;

  return {
    slug,
    event,
    dataState,
    retry,
  };
}
