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

  periodDays: (days: number) => `${days} day${days === 1 ? "" : "s"}`,
  stationsSnapshot: "Live snapshot · the period does not apply",
  railTitle: "Reports",
  emptyBreakdown: "None in this period",
  emptyReport: "No activity recorded in this period.",
  columns: { count: "Count", share: "Share" },
  total: "Total",
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
