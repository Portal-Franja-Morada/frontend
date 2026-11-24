import { useCallback, useEffect, useState } from "react";
import type { DataState } from "../lib/data-state";
import { readPreviewDataState } from "../lib/data-state";
import { EVENTS_PAGE_LIMIT } from "../lib/constants";
import { fetchPublicEvents, getApiBaseUrl } from "../lib/fetch-events";
import { formatEventsPeriodLabel } from "../lib/events-period";
import { mapPublicEventToListItem } from "../lib/map-event";
import {
  listRange,
  parseListPage,
  totalListPages,
  visiblePageNumbers,
} from "../lib/pagination";
import type { EventListItem } from "../types/view";

type FetchStatus = "idle" | "loading" | "error" | "ok";

const MISSING_API_URL_MESSAGE =
  "[@franja/landing] Falta PUBLIC_API_URL. Definila en apps/landing/.env para cargar datos del backend.";

function resolveDataState(
  preview: DataState | null,
  fetchStatus: FetchStatus,
  total: number,
): DataState {
  if (preview) {
    return preview;
  }
  if (fetchStatus === "loading") {
    return "cargando";
  }
  if (fetchStatus === "error") {
    return "error";
  }
  if (total === 0) {
    return "vacio";
  }
  return "ok";
}

export function useEventsPage() {
  const previewState = readPreviewDataState();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>(
    getApiBaseUrl() ? "loading" : "error",
  );

  const load = useCallback(async () => {
    const baseUrl = getApiBaseUrl();
    const requestedPage = parseListPage(window.location.search);

    if (!baseUrl) {
      console.warn(MISSING_API_URL_MESSAGE);
      setEvents([]);
      setPage(requestedPage);
      setTotal(0);
      setFetchStatus("error");
      return;
    }

    setFetchStatus("loading");
    try {
      const data = await fetchPublicEvents(baseUrl, requestedPage);
      const pages = totalListPages(data.total, EVENTS_PAGE_LIMIT);

      if (data.total > 0 && data.items.length === 0 && pages > 0) {
        const url = new URL(window.location.href);
        url.searchParams.set("page", String(pages));
        window.location.replace(url.toString());
        return;
      }

      setEvents(data.items.map(mapPublicEventToListItem));
      setPage(data.page);
      setTotal(data.total);
      setFetchStatus("ok");
    } catch {
      setEvents([]);
      setPage(requestedPage);
      setTotal(0);
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

  const pages = totalListPages(total, EVENTS_PAGE_LIMIT);
  const range = listRange(page, total, EVENTS_PAGE_LIMIT);
  const pageNumbers = visiblePageNumbers(page, pages);
  const dataState = resolveDataState(previewState, fetchStatus, total);
  const periodLabel =
    dataState === "ok"
      ? formatEventsPeriodLabel(events.map((e) => e.inicio))
      : null;
  const retry = previewState === "error" ? clearPreviewAndReload : load;

  return {
    events,
    dataState,
    page,
    total,
    pages,
    from: range.from,
    to: range.to,
    pageNumbers,
    periodLabel,
    retry,
  };
}
