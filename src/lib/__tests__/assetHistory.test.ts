import { describe, expect, it } from "vitest";
import type { LedgerEntryDto } from "../../@types/types";
import { filterHistory, groupHistoryByLoan, statusChangeOf, summarizeHistory } from "../assetHistory";

const T0 = Date.parse("2026-11-10T08:00:00Z");
const at = (minutes: number) => new Date(T0 + minutes * 60_000).toISOString();

let seq = 0;
const entry = (over: Partial<LedgerEntryDto> = {}): LedgerEntryDto =>
  ({
    id: String(++seq),
    event: "CHECKOUT",
    loanId: "loan-1",
    asset: { id: "a1", assetCode: "PRJ-1", name: "Projector" },
    student: null,
    instructor: null,
    actor: null,
    actorStation: null,
    photoUrl: null,
    approvalDecidedAt: null,
    details: null,
    occurredAt: at(0),
    ...over,
  }) as LedgerEntryDto;

const student = { id: "s1", fullName: "Juan Dela Cruz" };
const instructor = { id: "i1", fullName: "Maria Santos" };

describe("statusChangeOf", () => {
  it("uses the status recorded in details", () => {
    expect(statusChangeOf(entry({ event: "RETURN", details: { fromStatus: "OVERDUE", toStatus: "IN_STORAGE" } }))).toEqual({
      from: "OVERDUE",
      to: "IN_STORAGE",
      inferred: false,
    });
    expect(statusChangeOf(entry({ details: { oldStatus: "IN_STORAGE", newStatus: "IN_TRANSIT" } }))?.to).toBe("IN_TRANSIT");
  });

  it("infers the status from the event when details are missing", () => {
    expect(statusChangeOf(entry({ event: "ROOM_VERIFIED" }))).toEqual({ from: null, to: "IN_ROOM_VERIFIED", inferred: true });
    expect(statusChangeOf(entry({ event: "LATE_ARRIVAL_WARNING" }))?.to).toBe("LOCATION_ANOMALY");
    expect(statusChangeOf(entry({ event: "OVERDUE" }))?.to).toBe("OVERDUE");
    expect(statusChangeOf(entry({ event: "MARKED_MISSING" }))?.to).toBe("MISSING");
    expect(statusChangeOf(entry({ event: "RETURN" }))?.to).toBe("IN_STORAGE");
  });

  it("only infers checkout as in transit for instructor-approved loans", () => {
    expect(statusChangeOf(entry({ instructor }))?.to).toBe("IN_TRANSIT");
    expect(statusChangeOf(entry())).toBeNull();
  });

  it("ignores settlements and unknown statuses", () => {
    expect(statusChangeOf(entry({ event: "SETTLED" }))).toBeNull();
    expect(statusChangeOf(entry({ event: "SETTLED", details: { toStatus: "BOGUS" } }))).toBeNull();
  });
});

describe("groupHistoryByLoan", () => {
  const history = [
    entry({ id: "r1", event: "RETURN", loanId: "loan-1", occurredAt: at(100) }),
    entry({ id: "c1", event: "CHECKOUT", loanId: "loan-1", student, instructor, photoUrl: "/p1.jpg", occurredAt: at(0) }),
    entry({ id: "v1", event: "ROOM_VERIFIED", loanId: "loan-1", occurredAt: at(5) }),
    entry({ id: "c2", event: "CHECKOUT", loanId: "loan-2", student, occurredAt: at(200) }),
    entry({ id: "m2", event: "MARKED_MISSING", loanId: "loan-2", occurredAt: at(400) }),
  ];

  it("groups per loan, newest loan first, events oldest first", () => {
    const groups = groupHistoryByLoan(history);
    expect(groups.map((g) => g.loanId)).toEqual(["loan-2", "loan-1"]);
    expect(groups[1].entries.map((e) => e.id)).toEqual(["c1", "v1", "r1"]);
  });

  it("collects borrower, approver, photo and outcome", () => {
    const [missing, returned] = groupHistoryByLoan(history);
    expect(returned).toMatchObject({
      borrower: "Juan Dela Cruz",
      approvedBy: "Maria Santos",
      photoUrl: "/p1.jpg",
      outcome: "RETURNED",
      checkoutAt: at(0),
    });
    expect(missing).toMatchObject({ outcome: "MISSING", photoUrl: null, approvedBy: null });
  });

  it("summarizes and filters", () => {
    const groups = groupHistoryByLoan(history);
    // c1 (approved checkout), v1, r1, m2 change status; c2 (no instructor) does not.
    expect(summarizeHistory(groups)).toEqual({ loans: 2, statusChanges: 4, photos: 1 });
    expect(filterHistory(groups, "PHOTOS").map((g) => g.loanId)).toEqual(["loan-1"]);
    expect(filterHistory(groups, "STATUS")[0].entries.map((e) => e.id)).toEqual(["m2"]);
    expect(filterHistory(groups, "ALL")).toBe(groups);
  });

  it("returns nothing for an empty history", () => {
    expect(groupHistoryByLoan([])).toEqual([]);
  });
});
