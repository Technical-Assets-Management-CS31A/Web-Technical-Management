import type { ListParams, Paged } from "../@types/types";

// Shared list helpers. PRD 6.3: every list endpoint supports page, pageSize, sort and q.

/** Drops empty filters (undefined, null, "") and sends multi-value filters comma-separated. false is kept: it is a real filter value. */
export const toListQuery = (params: object) =>
  Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : value])
      .filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );

type PageMeta = { page?: number; pageSize?: number; total?: number; totalCount?: number; totalPages?: number };

const slice = <T>(all: T[], page: number, pageSize: number): Paged<T> => ({
  items: all.slice((page - 1) * pageSize, page * pageSize),
  page,
  pageSize,
  total: all.length,
  totalPages: Math.max(1, Math.ceil(all.length / pageSize)),
});

/**
 * The paged envelope is not pinned down in the PRD yet, so this accepts
 * { data: T[], meta }, { data: { items, ...meta } } and { items, ...meta }.
 * A list without a total means the server is not paging yet: it is sliced here.
 */
export const toPaged = <T>(body: unknown, { page, pageSize }: Pick<ListParams, "page" | "pageSize">): Paged<T> => {
  if (Array.isArray(body)) return slice(body as T[], page, pageSize);

  const root = (body ?? {}) as { data?: unknown; items?: T[]; meta?: PageMeta } & PageMeta;
  const inner = root.data as ({ items?: T[] } & PageMeta) | T[] | undefined;

  let items: T[];
  let meta: PageMeta;
  if (Array.isArray(inner)) {
    items = inner;
    meta = root.meta ?? root;
  } else if (inner && Array.isArray(inner.items)) {
    items = inner.items;
    meta = inner;
  } else {
    items = root.items ?? [];
    meta = root.meta ?? root;
  }

  const total = meta.total ?? meta.totalCount;
  if (total === undefined) return slice(items, page, pageSize);

  const size = meta.pageSize ?? pageSize;
  return {
    items,
    page: meta.page ?? page,
    pageSize: size,
    total,
    totalPages: meta.totalPages ?? Math.max(1, Math.ceil(total / size)),
  };
};

const ALL_PAGE_SIZE = 100;

/** Every row matching the filters, fetched page by page (exports, pickers, small lists). */
export const fetchAllPages = async <T, P extends object>(
  list: (params: P & Pick<ListParams, "page" | "pageSize">) => Promise<Paged<T>>,
  params: P,
): Promise<T[]> => {
  const first = await list({ ...params, page: 1, pageSize: ALL_PAGE_SIZE });
  if (first.totalPages <= 1 || first.items.length >= first.total) return first.items;

  const rest = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, i) => list({ ...params, page: i + 2, pageSize: ALL_PAGE_SIZE })),
  );
  return [first, ...rest].flatMap((p) => p.items);
};
