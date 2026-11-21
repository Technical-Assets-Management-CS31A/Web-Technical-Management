import { describe, expect, it } from "vitest";
import type { AnomalyDto } from "../../@types/types";
import {
  countByStatus,
  countByType,
  detectedAtOf,
  formatAge,
  isAnomalyTypeFilter,
  isAnomalyView,
  matchesAnomalySearch,
  queueRows,
} from "../anomalies";

const anomaly = (overrides: Partial<AnomalyDto> = {}): AnomalyDto => ({
  id: "a1",
  type: "WRONG_ROOM",
  status: "OPEN",
  asset: { id: "as1", assetCode: "LAP-001", name: "Dell Latitude" },
  loan: { id: "l1", loanNo: "LN-0001" },
  room: { id: "r1", code: "CL-201", name: "Computer Lab 201" },
  station: { id: "s1", stationCode: "RS-201" },
  resolutionNote: null,
  createdAt: "2026-11-18T01:00:00.000Z",
  ...overrides,
});

describe("queueRows", () => {
  const rows = [
    anomaly({ id: "ack-old", status: "ACKNOWLEDGED", createdAt: "2026-11-18T00:00:00.000Z" }),
    anomaly({ id: "open-new", createdAt: "2026-11-18T03:00:00.000Z" }),
    anomaly({ id: "open-old", createdAt: "2026-11-18T01:00:00.000Z", type: "TRANSIT_TIMEOUT" }),
    anomaly({ id: "done-1", status: "RESOLVED", resolvedAt: "2026-11-18T02:00:00.000Z" }),
    anomaly({ id: "done-2", status: "RESOLVED", resolvedAt: "2026-11-18T04:00:00.000Z" }),
  ];

  it("puts open before acknowledged, oldest first, and drops resolved from the active queue", () => {
    expect(queueRows(rows, { view: "active", type: "all", q: "" }).map((a) => a.id)).toEqual(["open-old", "open-new", "ack-old"]);
  });

  it("lists resolved anomalies newest resolution first", () => {
    expect(queueRows(rows, { view: "resolved", type: "all", q: "" }).map((a) => a.id)).toEqual(["done-2", "done-1"]);
  });

  it("filters by type and search", () => {
    expect(queueRows(rows, { view: "active", type: "TRANSIT_TIMEOUT", q: "" }).map((a) => a.id)).toEqual(["open-old"]);
    expect(queueRows(rows, { view: "active", type: "all", q: "nothing-matches" })).toEqual([]);
  });

  it("uses detectedAt over createdAt when the API sends it", () => {
    const late = anomaly({ id: "late", createdAt: "2026-11-18T00:00:00.000Z", detectedAt: "2026-11-18T05:00:00.000Z" });
    const early = anomaly({ id: "early", createdAt: "2026-11-18T02:00:00.000Z" });
    expect(detectedAtOf(late)).toBe("2026-11-18T05:00:00.000Z");
    expect(queueRows([late, early], { view: "active", type: "all", q: "" }).map((a) => a.id)).toEqual(["early", "late"]);
  });
});

describe("matchesAnomalySearch", () => {
  it("matches asset, loan, room and station, ignoring case", () => {
    const a = anomaly();
    expect(["lap-001", "ln-0001", "cl-201", "rs-201", "latitude"].every((q) => matchesAnomalySearch(a, q))).toBe(true);
    expect(matchesAnomalySearch(a, "projector")).toBe(false);
  });

  it("copes with anomalies that have no loan, room or station (unborrowed tap)", () => {
    const a = anomaly({ type: "UNBORROWED_TAP", loan: null, room: null, station: null });
    expect(matchesAnomalySearch(a, "LAP")).toBe(true);
    expect(matchesAnomalySearch(a, "CL-201")).toBe(false);
  });
});

describe("counts", () => {
  const list = [anomaly(), anomaly({ type: "UNBORROWED_TAP", status: "ACKNOWLEDGED" }), anomaly({ type: "UNBORROWED_TAP" })];

  it("counts by type and by status", () => {
    expect(countByType(list)).toEqual({ all: 3, WRONG_ROOM: 1, UNBORROWED_TAP: 2, TRANSIT_TIMEOUT: 0 });
    expect(countByStatus(list)).toEqual({ OPEN: 2, ACKNOWLEDGED: 1, RESOLVED: 0 });
  });
});

describe("formatAge", () => {
  const start = "2026-11-18T00:00:00.000Z";
  const at = (ms: number) => Date.parse(start) + ms;

  it("formats seconds, minutes, hours and days", () => {
    expect(formatAge(start, at(45_000))).toBe("45s");
    expect(formatAge(start, at(12 * 60_000))).toBe("12m");
    expect(formatAge(start, at(3 * 3_600_000 + 5 * 60_000))).toBe("3h 5m");
    expect(formatAge(start, at(2 * 3_600_000))).toBe("2h");
    expect(formatAge(start, at(2 * 86_400_000 + 4 * 3_600_000))).toBe("2d 4h");
  });

  it("never goes negative when the clock is behind", () => {
    expect(formatAge(start, at(-5_000))).toBe("0s");
  });
});

describe("search param guards", () => {
  it("accepts only known views and types", () => {
    expect(isAnomalyView("resolved")).toBe(true);
    expect(isAnomalyView("archived")).toBe(false);
    expect(isAnomalyTypeFilter("WRONG_ROOM")).toBe(true);
    expect(isAnomalyTypeFilter("UNKNOWN_TAG")).toBe(false);
  });
});
