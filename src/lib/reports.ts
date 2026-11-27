import type { ReportKey } from "../@types/types";
import type { ReportPeriod } from "../api/reports_api";

export const REPORT_KEYS: ReportKey[] = ["loans", "anomalies", "violations", "kiosk", "stations", "audits", "events"];
export const isReportKey = (value: unknown): value is ReportKey => REPORT_KEYS.includes(value as ReportKey);

export type ReportRange = "7d" | "30d" | "90d" | "custom";
export const REPORT_RANGES: ReportRange[] = ["7d", "30d", "90d", "custom"];
export const DEFAULT_RANGE: ReportRange = "30d";
export const isReportRange = (value: unknown): value is ReportRange => REPORT_RANGES.includes(value as ReportRange);

const PRESET_DAYS: Record<Exclude<ReportRange, "custom">, number> = { "7d": 7, "30d": 30, "90d": 90 };

/** YYYY-MM-DD, the value of an <input type="date">. */
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const isDateInput = (value: unknown): value is string => typeof value === "string" && DATE_RE.test(value);

/** Local calendar date as YYYY-MM-DD. */
export const toDateInput = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const startOfDay = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};
const endOfDay = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
};

/**
 * Whole local days, so the query key only changes once a day: a preset of N days ends today and
 * starts N-1 days earlier. Returns null when a custom range is incomplete or backwards (the API answers 400).
 */
export const resolvePeriod = (
  range: ReportRange,
  custom: { from?: string; to?: string },
  today: Date = new Date(),
): ReportPeriod | null => {
  const todayYmd = toDateInput(today);
  if (range === "custom") {
    if (!isDateInput(custom.from) || !isDateInput(custom.to) || custom.from > custom.to) return null;
    return { from: startOfDay(custom.from).toISOString(), to: endOfDay(custom.to).toISOString() };
  }
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (PRESET_DAYS[range] - 1));
  return { from: startOfDay(toDateInput(start)).toISOString(), to: endOfDay(todayYmd).toISOString() };
};

export type StatFormat = "count" | "minutes" | "money";

// The docs ask to key the UI on report key and stat position, not on the (rewordable) label.
const STAT_FORMATS: Partial<Record<ReportKey, Record<number, StatFormat>>> = {
  loans: { 6: "minutes", 7: "minutes" },
  anomalies: { 4: "minutes" },
  violations: { 4: "money" },
  kiosk: { 6: "minutes" },
};

export const statFormat = (key: ReportKey, index: number): StatFormat => STAT_FORMATS[key]?.[index] ?? "count";

const php = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
const count = new Intl.NumberFormat("en-US");
const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export const formatStat = (value: number, format: StatFormat) => {
  if (format === "money") return php.format(value);
  if (format === "minutes") return `${decimal.format(value)} min`;
  return count.format(value);
};

/** Room names come as plain text; everything else is an UPPER_SNAKE enum or a failure code. */
export const isEnumLabel = (label: string) => /^[A-Z0-9_]+$/.test(label);
