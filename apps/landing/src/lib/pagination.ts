import { POSTS_PAGE_LIMIT } from "./constants";

export function parseListPage(search: string): number {
  const raw = new URLSearchParams(search).get("page");
  const page = Number.parseInt(raw ?? "1", 10);
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }
  return page;
}

/** @deprecated Use parseListPage */
export const parsePostsPage = parseListPage;

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

export function visiblePageNumbers(current: number, pages: number): number[] {
  if (pages <= 3) {
    return Array.from({ length: pages }, (_, index) => index + 1);
  }

  if (current <= 2) {
    return [1, 2, 3];
  }

  if (current >= pages - 1) {
    return [pages - 2, pages - 1, pages];
  }

  return [current - 1, current, current + 1];
}

export function totalPages(total: number): number {
  return totalListPages(total, POSTS_PAGE_LIMIT);
}

export function postsRange(page: number, total: number) {
  return listRange(page, total, POSTS_PAGE_LIMIT);
}
