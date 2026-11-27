import { describe, expect, it } from "vitest";
import { formatStat, isEnumLabel, isReportKey, isReportRange, resolvePeriod, statFormat, toDateInput } from "../reports";

const today = new Date(2026, 10, 28, 15, 30); // Nov 28 2026, local time

describe("resolvePeriod", () => {
  it("covers whole local days, ending today", () => {
    const p = resolvePeriod("7d", {}, today)!;
    expect(new Date(p.from!)).toEqual(new Date(2026, 10, 22, 0, 0, 0, 0));
    expect(new Date(p.to!)).toEqual(new Date(2026, 10, 28, 23, 59, 59, 999));
  });

  it("gives the same period all day, so the query key is stable", () => {
    expect(resolvePeriod("30d", {}, new Date(2026, 10, 28, 0, 1))).toEqual(resolvePeriod("30d", {}, new Date(2026, 10, 28, 23, 58)));
  });

  it("uses the custom dates as inclusive days", () => {
    const p = resolvePeriod("custom", { from: "2026-11-01", to: "2026-11-01" }, today)!;
    expect(new Date(p.from!)).toEqual(new Date(2026, 10, 1, 0, 0, 0, 0));
    expect(new Date(p.to!)).toEqual(new Date(2026, 10, 1, 23, 59, 59, 999));
  });

  it("rejects an incomplete or backwards custom range", () => {
    expect(resolvePeriod("custom", { from: "2026-11-10" }, today)).toBeNull();
    expect(resolvePeriod("custom", { from: "2026-11-10", to: "2026-11-09" }, today)).toBeNull();
  });
});

describe("stat formatting", () => {
  it("formats by report key and stat position", () => {
    expect(statFormat("loans", 0)).toBe("count");
    expect(statFormat("loans", 6)).toBe("minutes");
    expect(statFormat("violations", 4)).toBe("money");
    expect(statFormat("stations", 3)).toBe("count");
  });

  it("renders each format", () => {
    expect(formatStat(1234, "count")).toBe("1,234");
    expect(formatStat(12.25, "minutes")).toBe("12.3 min");
    expect(formatStat(500, "money")).toContain("500.00");
  });
});

describe("guards", () => {
  it("accepts only known keys and ranges", () => {
    expect(isReportKey("loans")).toBe(true);
    expect(isReportKey("nope")).toBe(false);
    expect(isReportRange("90d")).toBe(true);
    expect(isReportRange("1y")).toBe(false);
  });

  it("tells enum labels from room names", () => {
    expect(isEnumLabel("IN_TRANSIT")).toBe(true);
    expect(isEnumLabel("Room 301")).toBe(false);
  });

  it("formats local dates for date inputs", () => {
    expect(toDateInput(today)).toBe("2026-11-28");
  });
});
