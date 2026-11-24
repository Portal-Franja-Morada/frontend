import { useCallback, useEffect, useState } from "react";
import type { DataState } from "../lib/data-state";
import { readPreviewDataState } from "../lib/data-state";
import { fetchPublicPosts, getApiBaseUrl } from "../lib/fetch-posts";
import { mapPublicPostToNewsItem } from "../lib/map-post";
import {
  parsePostsPage,
  postsRange,
  totalPages,
  visiblePageNumbers,
} from "../lib/pagination";
import type { NewsItem } from "../types/view";

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

export function usePostsPage() {
  const previewState = readPreviewDataState();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>(
    getApiBaseUrl() ? "loading" : "error",
  );

  const load = useCallback(async () => {
    const baseUrl = getApiBaseUrl();
    const requestedPage = parsePostsPage(window.location.search);

    if (!baseUrl) {
      console.warn(MISSING_API_URL_MESSAGE);
      setNews([]);
      setPage(requestedPage);
      setTotal(0);
      setFetchStatus("error");
      return;
    }

    setFetchStatus("loading");
    try {
      const data = await fetchPublicPosts(baseUrl, requestedPage);
      const pages = totalPages(data.total);

      if (data.total > 0 && data.items.length === 0 && pages > 0) {
        const url = new URL(window.location.href);
        url.searchParams.set("page", String(pages));
        window.location.replace(url.toString());
        return;
      }

      setNews(data.items.map(mapPublicPostToNewsItem));
      setPage(data.page);
      setTotal(data.total);
      setFetchStatus("ok");
    } catch {
      setNews([]);
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

  const pages = totalPages(total);
  const range = postsRange(page, total);
  const pageNumbers = visiblePageNumbers(page, pages);
  const dataState = resolveDataState(previewState, fetchStatus, total);
  const retry = previewState === "error" ? clearPreviewAndReload : load;

  return {
    news,
    dataState,
    page,
    total,
    pages,
    from: range.from,
    to: range.to,
    pageNumbers,
    retry,
  };
}
