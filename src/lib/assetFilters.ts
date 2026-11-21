import type { AssetDto, AssetListParams, Paged } from "../@types/types";
import type { AssetFilters, AssetSort } from "../states/inventory-list-state";

// FR-4.4: search and filter the Assets screen. Pure helpers, kept out of the component so they can be unit tested.
//
// GET /assets (TAMS-98) filters by q (asset code, name, RFID tag), categoryId, homeRoomId, one status and type,
// and sorts by assetCode, name or createdAt. Serial number search, condition, current room and "recently
// updated" are not on the server, so when one of them is used the screen fetches every asset matching the
// server filters and finishes filtering, sorting and paging here. A lab inventory is small enough for that.

export type ListMode = "server" | "client";

const SERVER_SORTS: AssetSort[] = ["-createdAt", "createdAt", "name", "assetCode"];

/** Server paging when every active filter is one GET /assets understands. */
export const listMode = (f: AssetFilters): ListMode =>
  f.search || f.condition || (f.roomId && f.roomScope === "current") || !SERVER_SORTS.includes(f.sort) ? "client" : "server";

/**
 * The GET /assets query for these filters. In client mode q and the sort are left off: the server's q does not
 * look at the serial number, and its sort does not know updatedAt.
 */
export const serverParams = (f: AssetFilters, includeDeleted: boolean): Omit<AssetListParams, "page" | "pageSize"> => {
  const client = listMode(f) === "client";
  return {
    q: client ? undefined : f.search || undefined,
    categoryId: f.categoryId || undefined,
    homeRoomId: f.roomId && f.roomScope === "home" ? f.roomId : undefined,
    status: f.status || undefined,
    type: f.type || undefined,
    includeDeleted: includeDeleted || undefined,
    sort: client ? undefined : f.sort,
  };
};

/** Lowercase, without spaces, colons or dashes, so "04:a1-b2" finds tag 04A1B2. */
const compact = (s: string) => s.toLowerCase().replace(/[\s:-]/g, "");

/** Name, asset code, serial number or RFID tag contains the search text (case-insensitive). */
export const matchesAssetSearch = (asset: AssetDto, term: string) => {
  const q = term.trim().toLowerCase();
  if (!q) return true;
  const text = [asset.name, asset.assetCode, asset.serialNo].some((v) => v?.toLowerCase().includes(q));
  if (text) return true;
  const tag = compact(q);
  return !!tag && !!asset.rfidTagUid && compact(asset.rfidTagUid).includes(tag);
};

/** Everything the server could not do: search (with serial), condition and current room. */
export const applyClientFilters = (assets: AssetDto[], f: AssetFilters) =>
  assets.filter(
    (a) =>
      matchesAssetSearch(a, f.search) &&
      (!f.condition || a.condition === f.condition) &&
      (!f.roomId || f.roomScope !== "current" || a.currentRoomId === f.roomId),
  );

const time = (iso: string | null | undefined) => {
  const t = iso ? new Date(iso).getTime() : NaN;
  return Number.isFinite(t) ? t : 0;
};

/** Same orders as the server, plus recently updated. Ties fall back to the asset code. */
export const sortAssets = (assets: AssetDto[], sort: AssetSort) => {
  const desc = sort.startsWith("-");
  const key = sort.replace(/^-/, "");
  const byCode = (a: AssetDto, b: AssetDto) => a.assetCode.localeCompare(b.assetCode);
  const cmp = (a: AssetDto, b: AssetDto) => {
    if (key === "name") return a.name.localeCompare(b.name);
    if (key === "assetCode") return byCode(a, b);
    if (key === "updatedAt") return time(a.updatedAt) - time(b.updatedAt);
    return time(a.createdAt) - time(b.createdAt);
  };
  return [...assets].sort((a, b) => (desc ? cmp(b, a) : cmp(a, b)) || byCode(a, b));
};

export const pageOf = <T>(items: T[], page: number, pageSize: number): Paged<T> => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);
  return {
    items: items.slice((current - 1) * pageSize, current * pageSize),
    page: current,
    pageSize,
    total: items.length,
    totalPages,
  };
};

/** Narrowing filters that "Clear all" resets (search, sort and the deleted toggle are kept). */
export const activeFilterCount = (f: AssetFilters) =>
  [f.categoryId, f.roomId, f.status, f.condition, f.type].filter(Boolean).length;
