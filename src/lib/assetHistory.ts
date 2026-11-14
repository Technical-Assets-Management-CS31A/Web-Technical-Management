import type { AssetStatus, LedgerEntryDto, LedgerEvent } from "../@types/types";

// Pure helpers for the asset detail history timeline (PRD 6.3 GET /assets/{id}/history, PRD 6.5 Assets screen).
// The endpoint returns transaction_ledger rows for the asset; we group them per loan and work out the status change
// each event caused, so the page can show loans, status changes and checkout photos in one timeline.

const ASSET_STATUSES: readonly AssetStatus[] = [
  "IN_STORAGE", "AT_COUNTER", "IN_TRANSIT", "IN_ROOM_VERIFIED",
  "LOCATION_ANOMALY", "OVERDUE", "MISSING", "MAINTENANCE", "RETIRED",
];

const asStatus = (value: unknown): AssetStatus | null =>
  typeof value === "string" && (ASSET_STATUSES as readonly string[]).includes(value) ? (value as AssetStatus) : null;

/**
 * The asset status each ledger event leaves the asset in (PRD 7.2: status is derived from the open loan).
 * CHECKOUT is only certain for standard loans (instructor approved → in transit to the room), and SETTLED does
 * not change the asset, so neither is inferred here.
 */
const STATUS_AFTER: Partial<Record<LedgerEvent, AssetStatus>> = {
  ROOM_VERIFIED: "IN_ROOM_VERIFIED",
  LATE_ARRIVAL_WARNING: "LOCATION_ANOMALY",
  RETURN: "IN_STORAGE",
  OVERDUE: "OVERDUE",
  MARKED_MISSING: "MISSING",
};

export type StatusChange = { from: AssetStatus | null; to: AssetStatus; inferred: boolean };

/** Status change recorded on the entry (details.fromStatus/toStatus or oldStatus/newStatus), else inferred from the event. */
export const statusChangeOf = (entry: LedgerEntryDto): StatusChange | null => {
  const d = entry.details ?? {};
  const to = asStatus(d.toStatus ?? d.newStatus);
  const from = asStatus(d.fromStatus ?? d.oldStatus);
  if (to) return { from, to, inferred: false };

  const guessed = STATUS_AFTER[entry.event] ?? (entry.event === "CHECKOUT" && entry.instructor ? "IN_TRANSIT" : undefined);
  return guessed ? { from, to: guessed, inferred: true } : null;
};

export type LoanOutcome = "OPEN" | "RETURNED" | "MISSING" | "SETTLED";

export type LoanGroup = {
  loanId: string;
  /** Oldest event first, so each loan reads as a story. */
  entries: LedgerEntryDto[];
  checkoutAt: string | null;
  lastAt: string;
  borrower: string | null;
  approvedBy: string | null;
  /** Checkout photo of this loan, if staff may see it. */
  photoUrl: string | null;
  outcome: LoanOutcome;
};

const time = (iso: string) => {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
};

const outcomeOf = (events: Set<LedgerEvent>): LoanOutcome => {
  if (events.has("SETTLED")) return "SETTLED";
  if (events.has("MARKED_MISSING")) return "MISSING";
  if (events.has("RETURN")) return "RETURNED";
  return "OPEN";
};

/** Ledger rows grouped by loan, newest loan first. */
export const groupHistoryByLoan = (history: LedgerEntryDto[]): LoanGroup[] => {
  const byLoan = new Map<string, LedgerEntryDto[]>();
  for (const entry of history) {
    const key = entry.loanId || `entry:${entry.id}`;
    const list = byLoan.get(key);
    if (list) list.push(entry);
    else byLoan.set(key, [entry]);
  }

  const groups = [...byLoan.entries()].map(([loanId, rows]): LoanGroup => {
    const entries = [...rows].sort((a, b) => time(a.occurredAt) - time(b.occurredAt));
    const checkout = entries.find((e) => e.event === "CHECKOUT") ?? null;
    const withStudent = entries.find((e) => e.student);
    const withInstructor = entries.find((e) => e.instructor);
    return {
      loanId,
      entries,
      checkoutAt: checkout?.occurredAt ?? null,
      lastAt: entries[entries.length - 1].occurredAt,
      borrower: withStudent?.student?.fullName ?? null,
      approvedBy: withInstructor?.instructor?.fullName ?? null,
      photoUrl: checkout?.photoUrl ?? entries.find((e) => e.photoUrl)?.photoUrl ?? null,
      outcome: outcomeOf(new Set(entries.map((e) => e.event))),
    };
  });

  return groups.sort((a, b) => time(b.lastAt) - time(a.lastAt));
};

export type HistorySummary = { loans: number; statusChanges: number; photos: number };

export const summarizeHistory = (groups: LoanGroup[]): HistorySummary => ({
  loans: groups.filter((g) => g.checkoutAt).length,
  statusChanges: groups.reduce((n, g) => n + g.entries.filter((e) => statusChangeOf(e)).length, 0),
  photos: groups.filter((g) => g.photoUrl).length,
});

export type HistoryFilter = "ALL" | "STATUS" | "PHOTOS";

/** Applies the timeline filter: status changes keeps only events that moved the asset, photos keeps loans with one. */
export const filterHistory = (groups: LoanGroup[], filter: HistoryFilter): LoanGroup[] => {
  if (filter === "PHOTOS") return groups.filter((g) => g.photoUrl);
  if (filter === "STATUS") {
    return groups
      .map((g) => ({ ...g, entries: g.entries.filter((e) => statusChangeOf(e)) }))
      .filter((g) => g.entries.length > 0);
  }
  return groups;
};
