import type { ReportKey } from "../@types/types";
import type { ReportRange } from "../lib/reports";

export const REPORTS_CONTENT = {
  badge: "Administration",
  title: "Reports",
  description: "Figures for loans, penalties, kiosk sessions, stations, audits and events, computed live for the period you pick.",

  ranges: [
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
    { value: "custom", label: "Custom" },
  ] satisfies { value: ReportRange; label: string }[],
  fromLabel: "From",
  toLabel: "To",
  customInvalid: "Pick a start date on or before the end date.",

  stationsSnapshot: "Station health is a live snapshot; the period does not apply.",
  emptyBreakdown: "Nothing in this period.",
  breakdownsTitle: "Breakdowns",
  refreshing: "Updating",

  adminOnly: {
    title: "Reports are for admins",
    description: "Ask an administrator if you need these figures.",
  },
  listError: "Couldn't load reports",
  detailError: "Couldn't load this report",

  // Breakdown names from the API (docs/REPORTS.md) -> section titles.
  breakdowns: {
    byStatus: "By status",
    byType: "By type",
    byCustody: "By custody",
    byRoom: "Top destination rooms",
    byHealth: "By health",
    bySource: "By source",
    marksByReason: "Marks by reason",
    freezesByReason: "Freezes by reason",
    liabilitiesByStatus: "Liabilities by status",
    liabilitiesByReason: "Liabilities by reason",
    sessionsByStatus: "Sessions by status",
    sessionsByType: "Sessions by type",
    failureCodes: "Failure codes",
    approvalsByDecision: "Approvals by decision",
    unmatchedByRoom: "Unmatched items by room",
  } as Record<string, string>,
} as const;

/** Per-report accent, used for the card icon tile and the breakdown bars. */
export const REPORT_TONES: Record<ReportKey, { tile: string; bar: string }> = {
  loans: { tile: "bg-blue-50 text-blue-600", bar: "bg-blue-500" },
  anomalies: { tile: "bg-rose-50 text-rose-600", bar: "bg-rose-500" },
  violations: { tile: "bg-amber-50 text-amber-600", bar: "bg-amber-500" },
  kiosk: { tile: "bg-violet-50 text-violet-600", bar: "bg-violet-500" },
  stations: { tile: "bg-emerald-50 text-emerald-600", bar: "bg-emerald-500" },
  audits: { tile: "bg-sky-50 text-sky-600", bar: "bg-sky-500" },
  events: { tile: "bg-indigo-50 text-indigo-600", bar: "bg-indigo-500" },
};
