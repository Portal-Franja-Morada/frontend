import { ADMIN_EVENTS_PAGE_LIMIT, ADMIN_POSTS_PAGE_LIMIT } from "./constants";

export function parseListPage(search: string): number {
  const raw = new URLSearchParams(search).get("page");
  const page = Number.parseInt(raw ?? "1", 10);
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }
  return page;
}

export function totalListPages(total: number, pageSize: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.ceil(total / pageSize);
}

export function listRange(page: number, total: number, pageSize: number) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return { from, to };
}

export function adminPostsRange(page: number, total: number) {
  return listRange(page, total, ADMIN_POSTS_PAGE_LIMIT);
}

export function adminPostsTotalPages(total: number) {
  return totalListPages(total, ADMIN_POSTS_PAGE_LIMIT);
}

export function adminEventsRange(page: number, total: number) {
  return listRange(page, total, ADMIN_EVENTS_PAGE_LIMIT);
}

export function adminEventsTotalPages(total: number) {
  return totalListPages(total, ADMIN_EVENTS_PAGE_LIMIT);
}
