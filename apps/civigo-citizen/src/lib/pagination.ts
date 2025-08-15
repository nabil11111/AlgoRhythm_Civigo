export type Pagination = { page: number; pageSize: number; offset: number };

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

export function parsePagination(searchParams?: {
  page?: string;
  pageSize?: string;
}): Pagination {
  const page = Math.max(
    DEFAULT_PAGE,
    Number(searchParams?.page ?? DEFAULT_PAGE) || DEFAULT_PAGE
  );
  const rawSize = Number(searchParams?.pageSize ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, rawSize));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

export function nextPageHref(basePath: string, p: Pagination) {
  const sp = new URLSearchParams({
    page: String(p.page + 1),
    pageSize: String(p.pageSize),
  });
  return `${basePath}?${sp.toString()}`;
}

export function prevPageHref(basePath: string, p: Pagination) {
  const page = Math.max(1, p.page - 1);
  const sp = new URLSearchParams({
    page: String(page),
    pageSize: String(p.pageSize),
  });
  return `${basePath}?${sp.toString()}`;
}


