import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { DataState } from "../lib/data-state";
import { readPreviewDataState } from "../lib/data-state";
import { getApiBaseUrl } from "../lib/api";
import {
  adminEventsRange,
  adminEventsTotalPages,
  parseListPage,
} from "../lib/pagination";
import { fetchAdminEventsStats, listAdminEvents } from "../lib/events-api";
import { SEARCH_DEBOUNCE_MS } from "../lib/constants";
import type {
  AdminContentStats,
  AdminEvent,
  ContentEstado,
} from "../types/content";

type FetchStatus = "idle" | "loading" | "error" | "ok";

function readEstadoFilter(search: string): ContentEstado | undefined {
  const value = new URLSearchParams(search).get("estado");
  if (value === "borrador" || value === "publicado") {
    return value;
  }
  return undefined;
}

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

export function useAdminEventsPage() {
  const previewState = readPreviewDataState();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [stats, setStats] = useState<AdminContentStats | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("q") ?? "",
  );
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>(
    getApiBaseUrl() ? "loading" : "error",
  );

  const query = searchParams.get("q") ?? "";
  const estadoFilter = readEstadoFilter(searchParams.toString());
  const requestedPage = parseListPage(searchParams.toString());

  const load = useCallback(async () => {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      setEvents([]);
      setStats(null);
      setPage(requestedPage);
      setTotal(0);
      setFetchStatus("error");
      return;
    }

    setFetchStatus("loading");
    try {
      const [list, counts] = await Promise.all([
        listAdminEvents({
          page: requestedPage,
          q: query || undefined,
          estado: estadoFilter,
        }),
        fetchAdminEventsStats(),
      ]);

      const pages = adminEventsTotalPages(list.total);
      if (list.total > 0 && list.items.length === 0 && pages > 0) {
        const next = new URLSearchParams(searchParams);
        next.set("page", String(pages));
        setSearchParams(next, { replace: true });
        return;
      }

      setEvents(list.items);
      setPage(list.page);
      setTotal(list.total);
      setStats(counts);
      setFetchStatus("ok");
    } catch {
      setEvents([]);
      setStats(null);
      setPage(requestedPage);
      setTotal(0);
      setFetchStatus("error");
    }
  }, [estadoFilter, query, requestedPage, searchParams, setSearchParams]);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    if (previewState) {
      return;
    }
    void load();
  }, [load, previewState]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      const current = searchParams.get("q") ?? "";
      if (trimmed === current) {
        return;
      }
      const next = new URLSearchParams(searchParams);
      if (trimmed) {
        next.set("q", trimmed);
      } else {
        next.delete("q");
      }
      next.delete("page");
      setSearchParams(next, { replace: true });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [searchInput, searchParams, setSearchParams]);

  const clearPreviewAndReload = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("estado");
    setSearchParams(next, { replace: true });
    window.location.reload();
  }, [searchParams, setSearchParams]);

  const setEstadoFilter = useCallback(
    (estado: ContentEstado | "todos") => {
      const next = new URLSearchParams(searchParams);
      if (estado === "todos") {
        next.delete("estado");
      } else {
        next.set("estado", estado);
      }
      next.delete("page");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const goToPage = useCallback(
    (nextPage: number) => {
      const next = new URLSearchParams(searchParams);
      if (nextPage <= 1) {
        next.delete("page");
      } else {
        next.set("page", String(nextPage));
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const pages = adminEventsTotalPages(total);
  const range = adminEventsRange(page, total);
  const dataState = resolveDataState(previewState, fetchStatus, total);
  const retry = previewState === "error" ? clearPreviewAndReload : load;

  const selectValue = useMemo(() => estadoFilter ?? "todos", [estadoFilter]);

  const removeEvent = useCallback((id: string) => {
    setEvents((current) => current.filter((event) => event.id !== id));
    setTotal((current) => Math.max(0, current - 1));
  }, []);

  return {
    events,
    stats,
    dataState,
    page,
    total,
    pages,
    from: range.from,
    to: range.to,
    searchInput,
    setSearchInput,
    selectValue,
    setEstadoFilter,
    goToPage,
    retry,
    refresh: load,
    removeEvent,
  };
}
