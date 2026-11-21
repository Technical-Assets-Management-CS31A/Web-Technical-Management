import type { LedgerEvent } from "../@types/types";
import type { HistoryFilter, LoanOutcome } from "../lib/assetHistory";

// Text for the history timeline on the asset detail page (PRD 6.5: "asset detail with history timeline and photos").
export const ASSET_HISTORY_CONTENT = {
  title: "History",
  subtitle: "Loans, status changes and checkout photos from the transaction ledger.",
  summary: {
    loans: (n: number) => `${n} ${n === 1 ? "loan" : "loans"}`,
    statusChanges: (n: number) => `${n} status ${n === 1 ? "change" : "changes"}`,
    photos: (n: number) => `${n} ${n === 1 ? "photo" : "photos"}`,
  },
  filters: {
    ALL: "All events",
    STATUS: "Status changes",
    PHOTOS: "With photos",
  } satisfies Record<HistoryFilter, string>,
  loading: "Loading history...",
  error: "Could not load this asset's history.",
  retry: "Try again",
  empty: "No loan events yet. Checkouts, returns and status changes will appear here.",
  emptyFiltered: "No events match this filter.",
  loan: {
    openLoan: "View loan",
    approvedBy: "Approved by",
    noBorrower: "Unknown borrower",
    eventLoan: "Event loan",
  },
  outcome: {
    OPEN: "Open",
    RETURNED: "Returned",
    MISSING: "Missing",
    SETTLED: "Settled",
  } satisfies Record<LoanOutcome, string>,
  photo: {
    label: "Checkout photo",
    alt: (name: string | null) => (name ? `Checkout photo of ${name}` : "Checkout photo"),
    empty: "No photo",
  },
  event: {
    CHECKOUT: "Checked out at the kiosk",
    ROOM_VERIFIED: "Verified in room",
    LATE_ARRIVAL_WARNING: "Late arrival warning",
    RETURN: "Returned at the kiosk",
    OVERDUE: "Became overdue",
    MARKED_MISSING: "Marked missing",
    SETTLED: "Liability settled",
  } satisfies Record<LedgerEvent, string>,
  statusTo: "Status",
  inferredHint: "Derived from the event",
  by: (name: string) => `by ${name}`,
} as const;
