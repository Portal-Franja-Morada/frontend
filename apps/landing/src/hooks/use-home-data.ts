import { useCallback, useEffect, useState } from "react";
import type { DataState } from "../lib/data-state";
import { readPreviewDataState, sectionDataState } from "../lib/data-state";
import { fetchPublicHome, getApiBaseUrl } from "../lib/fetch-home";
import { mapHomeResponse } from "../lib/map-home";
import type { AgendaEvent, NewsItem } from "../types/view";

type FetchStatus = "idle" | "loading" | "error" | "ok";

type HomeData = {
  events: AgendaEvent[];
  news: NewsItem[];
  eventsState: DataState;
  newsState: DataState;
  retry: () => void;
};

const emptyHomeData = (preview: DataState): HomeData => ({
  events: [],
  news: [],
  eventsState: preview,
  newsState: preview,
  retry: () => undefined,
});

const MISSING_API_URL_MESSAGE =
  "[@franja/landing] Falta PUBLIC_API_URL. Definila en apps/landing/.env para cargar datos del backend.";

export function useHomeData(): HomeData {
  const apiBaseUrl = getApiBaseUrl();
  const previewState = readPreviewDataState();

  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>(
    apiBaseUrl ? "loading" : "error",
  );

  const load = useCallback(async () => {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      console.warn(MISSING_API_URL_MESSAGE);
      setEvents([]);
      setNews([]);
      setFetchStatus("error");
      return;
    }

    setFetchStatus("loading");
    try {
      const data = await fetchPublicHome(baseUrl);
      const mapped = mapHomeResponse(data);
      setEvents(mapped.events);
      setNews(mapped.news);
      setFetchStatus("ok");
    } catch {
      setEvents([]);
      setNews([]);
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

  if (previewState) {
    return {
      ...emptyHomeData(previewState),
      retry: previewState === "error" ? clearPreviewAndReload : load,
    };
  }

  return {
    events,
    news,
    eventsState: sectionDataState(fetchStatus, events.length),
    newsState: sectionDataState(fetchStatus, news.length),
    retry: load,
  };
}
