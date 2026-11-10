import { describe, expect, it } from "vitest";
import type { LoanDto } from "../../@types/types";
import { countByStatus, filterLoans, formatDuration, isLoanStatusFilter, matchesLoanSearch } from "../loanFilters";

const loan = (over: Partial<LoanDto> & { id: string }): LoanDto =>
  ({
    loanNo: `L-2026-${over.id}`,
    type: "STANDARD",
    status: "ACTIVE",
    custodyState: "VERIFIED",
    asset: { id: `a${over.id}`, assetCode: `PRJ-${over.id}`, name: "Projector", status: "IN_USE" },
    student: { id: "s1", studentNo: "2023-0001", fullName: "Juan Dela Cruz", sectionCode: "BSCS-3A" },
    approvedBy: { id: "i1", fullName: "Maria Santos" },
    destinationRoom: { id: "r1", code: "CL10", name: "Computer Lab 10" },
    checkedOutAt: "2026-11-10T08:00:00Z",
    transitDeadlineAt: null,
    verifiedAt: null,
    classLengthMinutes: 90,
    classEndsAt: "2026-11-10T09:30:00Z",
    graceMinutes: 15,
    dueAt: "2026-11-10T09:45:00Z",
    returnedAt: null,
    photoUrl: null,
    lateArrivalWarningNo: null,
    ...over,
  }) as LoanDto;

const loans = [
  loan({ id: "1", status: "RETURNED", checkedOutAt: "2026-11-09T08:00:00Z", returnedAt: "2026-11-09T09:30:00Z" }),
  loan({ id: "2", status: "ACTIVE", dueAt: "2026-11-10T12:00:00Z", checkedOutAt: "2026-11-10T10:00:00Z" }),
  loan({ id: "3", status: "OVERDUE", dueAt: "2026-11-10T07:00:00Z", checkedOutAt: "2026-11-10T05:00:00Z", destinationRoom: { id: "r2", code: "CL11", name: "Lab 11" } }),
  loan({ id: "4", status: "MISSING", checkedOutAt: "2026-11-08T08:00:00Z" }),
];

describe("loan filters", () => {
  it("counts every status plus the total", () => {
    expect(countByStatus(loans)).toEqual({ all: 4, ACTIVE: 1, OVERDUE: 1, RETURNED: 1, MISSING: 1 });
  });

  it("filters by status and room", () => {
    expect(filterLoans(loans, { status: "RETURNED" }).map((l) => l.id)).toEqual(["1"]);
    expect(filterLoans(loans, { roomId: "r2" }).map((l) => l.id)).toEqual(["3"]);
    expect(filterLoans(loans, { status: "ACTIVE", roomId: "r2" })).toEqual([]);
  });

  it("sorts newest first by default", () => {
    expect(filterLoans(loans, {}).map((l) => l.id)).toEqual(["2", "3", "1", "4"]);
  });

  it("sorts open loans first, soonest due on top, when sorting by due", () => {
    expect(filterLoans(loans, { sort: "due" }).map((l) => l.id)).toEqual(["3", "2", "1", "4"]);
  });

  it("searches loan no., asset, borrower and room", () => {
    expect(matchesLoanSearch(loans[0], "l-2026-1")).toBe(true);
    expect(matchesLoanSearch(loans[0], "dela cruz")).toBe(true);
    expect(matchesLoanSearch(loans[2], "cl11")).toBe(true);
    expect(matchesLoanSearch(loans[0], "cl11")).toBe(false);
    expect(matchesLoanSearch(loans[0], "  ")).toBe(true);
  });

  it("does not mutate the input array", () => {
    const copy = [...loans];
    filterLoans(loans, { sort: "due" });
    expect(loans).toEqual(copy);
  });

  it("only accepts known status filters from the URL", () => {
    expect(isLoanStatusFilter("OVERDUE")).toBe(true);
    expect(isLoanStatusFilter("BORROWED")).toBe(false);
    expect(isLoanStatusFilter(undefined)).toBe(false);
  });

  it("formats durations", () => {
    expect(formatDuration(5 * 60_000)).toBe("5m");
    expect(formatDuration(-90 * 60_000)).toBe("1h 30m");
    expect(formatDuration(26 * 3600_000)).toBe("1d 2h");
  });
});
