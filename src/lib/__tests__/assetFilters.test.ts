import { describe, expect, it } from "vitest";
import type { AssetDto } from "../../@types/types";
import { DEFAULT_ASSET_FILTERS, type AssetFilters } from "../../states/inventory-list-state";
import {
  activeFilterCount,
  applyClientFilters,
  listMode,
  matchesAssetSearch,
  pageOf,
  serverParams,
  sortAssets,
} from "../assetFilters";

const asset = (over: Partial<AssetDto> = {}): AssetDto =>
  ({
    id: "a1",
    assetCode: "LP-014",
    name: "Lenovo ThinkPad",
    category: { id: "c1", name: "Laptop", isBorrowable: true },
    type: "BORROWABLE",
    brand: null,
    model: null,
    serialNo: "PF-3XK9Q",
    rfidTagUid: "04A1B2C3",
    homeRoomId: "storage",
    currentRoomId: null,
    status: "IN_STORAGE",
    condition: "GOOD",
    replacementCost: 45000,
    acquiredAt: null,
    notes: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    deletedAt: null,
    ...over,
  }) as AssetDto;

const f = (over: Partial<AssetFilters> = {}): AssetFilters => ({ ...DEFAULT_ASSET_FILTERS, ...over });

describe("listMode", () => {
  it("pages on the server when GET /assets knows every filter", () => {
    expect(listMode(f())).toBe("server");
    expect(listMode(f({ categoryId: "c1", status: "MISSING", type: "FIXED", roomId: "r1", roomScope: "home", sort: "name" }))).toBe("server");
  });

  it("finishes on the client for search, condition, current room and recently updated", () => {
    expect(listMode(f({ search: "pf-3" }))).toBe("client");
    expect(listMode(f({ condition: "DAMAGED" }))).toBe("client");
    expect(listMode(f({ roomId: "r1", roomScope: "current" }))).toBe("client");
    expect(listMode(f({ sort: "-updatedAt" }))).toBe("client");
  });
});

describe("serverParams", () => {
  it("sends only what the server filters by", () => {
    expect(serverParams(f({ categoryId: "c1", roomId: "r1", status: "OVERDUE", sort: "name" }), false)).toEqual({
      q: undefined,
      categoryId: "c1",
      homeRoomId: "r1",
      status: "OVERDUE",
      type: undefined,
      includeDeleted: undefined,
      sort: "name",
    });
  });

  it("leaves q and sort off in client mode, and the room off when it is the current room", () => {
    const p = serverParams(f({ search: "lp", roomId: "r1", roomScope: "current", sort: "-updatedAt" }), true);
    expect(p).toMatchObject({ q: undefined, homeRoomId: undefined, sort: undefined, includeDeleted: true });
  });
});

describe("matchesAssetSearch", () => {
  it("matches name, code and serial, ignoring case", () => {
    expect(matchesAssetSearch(asset(), "thinkpad")).toBe(true);
    expect(matchesAssetSearch(asset(), "lp-0")).toBe(true);
    expect(matchesAssetSearch(asset(), "pf-3xk")).toBe(true);
    expect(matchesAssetSearch(asset(), "projector")).toBe(false);
    expect(matchesAssetSearch(asset(), "  ")).toBe(true);
  });

  it("matches the RFID tag with or without separators", () => {
    expect(matchesAssetSearch(asset(), "04a1")).toBe(true);
    expect(matchesAssetSearch(asset(), "04:A1:B2")).toBe(true);
    expect(matchesAssetSearch(asset({ rfidTagUid: null }), "04a1")).toBe(false);
  });
});

describe("applyClientFilters", () => {
  const list = [
    asset({ id: "1", condition: "GOOD", currentRoomId: "cl10" }),
    asset({ id: "2", condition: "DAMAGED", currentRoomId: "cl11", serialNo: "ZZ-1" }),
  ];

  it("filters by condition and current room", () => {
    expect(applyClientFilters(list, f({ condition: "DAMAGED" })).map((a) => a.id)).toEqual(["2"]);
    expect(applyClientFilters(list, f({ roomId: "cl10", roomScope: "current" })).map((a) => a.id)).toEqual(["1"]);
  });

  it("leaves the home room to the server", () => {
    expect(applyClientFilters(list, f({ roomId: "cl10", roomScope: "home" }))).toHaveLength(2);
  });

  it("combines search with the other filters", () => {
    expect(applyClientFilters(list, f({ search: "zz-1", condition: "GOOD" }))).toHaveLength(0);
  });
});

describe("sortAssets", () => {
  const list = [
    asset({ id: "b", assetCode: "B-1", name: "Beta", createdAt: "2026-01-02T00:00:00Z", updatedAt: "2026-03-01T00:00:00Z" }),
    asset({ id: "a", assetCode: "A-1", name: "Alpha", createdAt: "2026-01-03T00:00:00Z", updatedAt: "2026-02-01T00:00:00Z" }),
  ];

  it("sorts like the server and by recently updated", () => {
    expect(sortAssets(list, "name").map((a) => a.id)).toEqual(["a", "b"]);
    expect(sortAssets(list, "-createdAt").map((a) => a.id)).toEqual(["a", "b"]);
    expect(sortAssets(list, "-updatedAt").map((a) => a.id)).toEqual(["b", "a"]);
  });
});

describe("pageOf and activeFilterCount", () => {
  it("pages and clamps to the last page", () => {
    const p = pageOf([1, 2, 3, 4, 5], 3, 2);
    expect(p).toEqual({ items: [5], page: 3, pageSize: 2, total: 5, totalPages: 3 });
    expect(pageOf([1], 9, 10).page).toBe(1);
    expect(pageOf([], 1, 10).totalPages).toBe(1);
  });

  it("counts the narrowing filters", () => {
    expect(activeFilterCount(f({ search: "x", roomId: "r1", condition: "FAIR" }))).toBe(2);
  });
});
