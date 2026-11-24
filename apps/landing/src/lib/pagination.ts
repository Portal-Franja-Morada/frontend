import { POSTS_PAGE_LIMIT } from "./constants";

export function parsePostsPage(search: string): number {
  const raw = new URLSearchParams(search).get("page");
  const page = Number.parseInt(raw ?? "1", 10);
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }
  return page;
}

export function totalPages(total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.ceil(total / POSTS_PAGE_LIMIT);
}

export function postsRange(page: number, total: number) {
  const from = (page - 1) * POSTS_PAGE_LIMIT + 1;
  const to = Math.min(page * POSTS_PAGE_LIMIT, total);
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
