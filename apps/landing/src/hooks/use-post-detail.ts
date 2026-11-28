import { useCallback, useEffect, useState } from "react";
import type { DataState } from "../lib/data-state";
import { readPreviewDataState } from "../lib/data-state";
import { DEFAULT_NEWS_IMAGE } from "../lib/constants";
import {
  fetchPublicPost,
  getApiBaseUrl,
  PostNotFoundError,
} from "../lib/fetch-post";
import { formatPostDateLong } from "../lib/dates";
import { parsePostSlugFromPathname } from "../lib/post-slug";
import type { PublicPostDetail } from "../types/content";

type FetchStatus = "idle" | "loading" | "not_found" | "error" | "ok";

export type PostDetailView = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  image: string;
  imageAlt: string;
  gallery: string[];
  publishedAtLabel: string;
};

const MISSING_API_URL_MESSAGE =
  "[@franja/landing] Falta PUBLIC_API_URL. Definila en apps/landing/.env para cargar datos del backend.";

const DOCUMENT_TITLE_SUFFIX = " | Franja Morada · Económicas";

function mapPostDetail(post: PublicPostDetail): PostDetailView {
  return {
    slug: post.slug,
    title: post.titulo,
    summary: post.resumen,
    body: post.cuerpo,
    image: post.imagenUrl ?? DEFAULT_NEWS_IMAGE,
    imageAlt: post.titulo,
    gallery: post.galeria.map((item) => item.url),
    publishedAtLabel: formatPostDateLong(post.publicadoAt),
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

export function usePostDetail() {
  const previewState = readPreviewDataState();
  const slug =
    typeof window !== "undefined"
      ? parsePostSlugFromPathname(window.location.pathname)
      : null;

  const [post, setPost] = useState<PostDetailView | null>(null);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>(() => {
    if (previewState || getApiBaseUrl()) {
      return "loading";
    }
    return "error";
  });

  const load = useCallback(async () => {
    const baseUrl = getApiBaseUrl();
    const currentSlug = parsePostSlugFromPathname(window.location.pathname);

    if (!currentSlug) {
      setPost(null);
      setFetchStatus("not_found");
      return;
    }

    if (!baseUrl) {
      console.warn(MISSING_API_URL_MESSAGE);
      setPost(null);
      setFetchStatus("error");
      return;
    }

    setFetchStatus("loading");
    try {
      const data = await fetchPublicPost(baseUrl, currentSlug);
      const mapped = mapPostDetail(data);
      setPost(mapped);
      setFetchStatus("ok");
      document.title = `${mapped.title}${DOCUMENT_TITLE_SUFFIX}`;
    } catch (error) {
      setPost(null);
      if (error instanceof PostNotFoundError) {
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
    post,
    dataState,
    retry,
  };
}
