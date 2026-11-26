import type {
  AdminContentStats,
  AdminEvent,
  AdminEventsPage,
  ContentEstado,
} from "../types/content";
import { ADMIN_EVENTS_PAGE_LIMIT, ADMIN_LIST_FETCH_LIMIT } from "./constants";
import { apiFetch, readApiError } from "./api";

function isAdminEventsPage(data: unknown): data is AdminEventsPage {
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

type ListAdminEventsParams = {
  page: number;
  estado?: ContentEstado;
  q?: string;
};

function buildAdminEventsPath(params: ListAdminEventsParams): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("limit", String(ADMIN_EVENTS_PAGE_LIMIT));
  if (params.estado) {
    search.set("estado", params.estado);
  }
  if (params.q) {
    search.set("q", params.q);
  }
  return `/admin/events?${search.toString()}`;
}

async function fetchAdminEventsPage(
  params: ListAdminEventsParams,
): Promise<AdminEventsPage> {
  const response = await apiFetch(buildAdminEventsPath(params));
  if (!response.ok) {
    throw await readApiError(response);
  }
  const data: unknown = await response.json();
  if (!isAdminEventsPage(data)) {
    throw new Error("Respuesta de eventos inválida");
  }
  return data;
}

export async function listAdminEvents(
  params: ListAdminEventsParams,
): Promise<AdminEventsPage> {
  return fetchAdminEventsPage(params);
}

export async function fetchAdminEventsStats(): Promise<AdminContentStats> {
  const [totalPage, publicadosPage, borradoresPage] = await Promise.all([
    fetchAdminEventsPage({ page: 1 }),
    fetchAdminEventsPage({ page: 1, estado: "publicado" }),
    fetchAdminEventsPage({ page: 1, estado: "borrador" }),
  ]);
  return {
    total: totalPage.total,
    publicados: publicadosPage.total,
    borradores: borradoresPage.total,
  };
}

export async function fetchAdminEventById(
  id: string,
): Promise<AdminEvent | null> {
  let page = 1;

  for (;;) {
    const response = await apiFetch(
      `/admin/events?page=${page}&limit=${ADMIN_LIST_FETCH_LIMIT}`,
    );
    if (!response.ok) {
      throw await readApiError(response);
    }
    const data: unknown = await response.json();
    if (!isAdminEventsPage(data)) {
      throw new Error("Respuesta de eventos inválida");
    }
    const found = data.items.find((item) => item.id === id);
    if (found) {
      return found;
    }
    const pages = Math.ceil(data.total / ADMIN_LIST_FETCH_LIMIT);
    if (page >= pages || data.total === 0) {
      return null;
    }
    page += 1;
  }
}
