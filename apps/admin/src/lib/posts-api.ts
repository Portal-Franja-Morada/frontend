import type {
  AdminPost,
  AdminPostsPage,
  AdminPostsStats,
  ContentEstado,
  CreatePostPayload,
  UpdatePostPayload,
} from "../types/content";
import { ADMIN_POSTS_PAGE_LIMIT } from "./constants";
import { apiFetch, readApiError } from "./api";

function isAdminPostsPage(data: unknown): data is AdminPostsPage {
  if (!data || typeof data !== "object") {
    return false;
  }
  const record = data as Record<string, unknown>;
  return (
    Array.isArray(record.items) &&
    typeof record.page === "number" &&
    typeof record.total === "number"
  );
}

function isAdminPost(data: unknown): data is AdminPost {
  if (!data || typeof data !== "object") {
    return false;
  }
  const record = data as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.titulo === "string" &&
    typeof record.cuerpo === "string"
  );
}

type ListAdminPostsParams = {
  page: number;
  estado?: ContentEstado;
  q?: string;
};

function buildAdminPostsPath(params: ListAdminPostsParams): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("limit", String(ADMIN_POSTS_PAGE_LIMIT));
  if (params.estado) {
    search.set("estado", params.estado);
  }
  if (params.q) {
    search.set("q", params.q);
  }
  return `/admin/posts?${search.toString()}`;
}

async function fetchAdminPostsPage(
  params: ListAdminPostsParams,
): Promise<AdminPostsPage> {
  const response = await apiFetch(buildAdminPostsPath(params));
  if (!response.ok) {
    throw await readApiError(response);
  }
  const data: unknown = await response.json();
  if (!isAdminPostsPage(data)) {
    throw new Error("Respuesta de novedades inválida");
  }
  return data;
}

export async function listAdminPosts(
  params: ListAdminPostsParams,
): Promise<AdminPostsPage> {
  return fetchAdminPostsPage(params);
}

export async function fetchAdminPostsStats(): Promise<AdminPostsStats> {
  const [totalPage, publicadosPage, borradoresPage] = await Promise.all([
    fetchAdminPostsPage({ page: 1 }),
    fetchAdminPostsPage({ page: 1, estado: "publicado" }),
    fetchAdminPostsPage({ page: 1, estado: "borrador" }),
  ]);
  return {
    total: totalPage.total,
    publicados: publicadosPage.total,
    borradores: borradoresPage.total,
  };
}

export async function createPost(body: CreatePostPayload): Promise<AdminPost> {
  const response = await apiFetch("/admin/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw await readApiError(response);
  }
  const data: unknown = await response.json();
  if (!isAdminPost(data)) {
    throw new Error("Respuesta de novedad inválida");
  }
  return data;
}

export async function updatePost(
  id: string,
  body: UpdatePostPayload,
): Promise<AdminPost> {
  const response = await apiFetch(`/admin/posts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw await readApiError(response);
  }
  const data: unknown = await response.json();
  if (!isAdminPost(data)) {
    throw new Error("Respuesta de novedad inválida");
  }
  return data;
}

export async function publishPost(id: string): Promise<AdminPost> {
  const response = await apiFetch(`/admin/posts/${id}/publicar`, {
    method: "POST",
  });
  if (!response.ok) {
    throw await readApiError(response);
  }
  const data: unknown = await response.json();
  if (!isAdminPost(data)) {
    throw new Error("Respuesta de publicación inválida");
  }
  return data;
}
