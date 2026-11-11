import { describe, expect, it } from "vitest";
import type { LoanDto } from "../../@types/types";
import { buildLoanTimeline, dueState, minutesToText } from "../loanDetail";

const T0 = Date.parse("2026-11-10T08:00:00Z");
const at = (minutes: number) => new Date(T0 + minutes * 60_000).toISOString();

const loan = (over: Partial<LoanDto> = {}): LoanDto =>
  ({
    id: "1",
    loanNo: "L-2026-000001",
    type: "STANDARD",
    status: "ACTIVE",
    custodyState: "AWAITING_ARRIVAL",
    asset: { id: "a1", assetCode: "PRJ-1", name: "Projector", status: "IN_TRANSIT" },
    student: { id: "s1", studentNo: "2023-0001", fullName: "Juan Dela Cruz", sectionCode: "BSCS-3A" },
    approvedBy: { id: "i1", fullName: "Maria Santos" },
    destinationRoom: { id: "r1", code: "CL10", name: "Computer Lab 10" },
    checkedOutAt: at(0),
    transitDeadlineAt: at(10),
    verifiedAt: null,
    classLengthMinutes: 90,
    classEndsAt: at(90),
    graceMinutes: 15,
    dueAt: at(105),
    returnedAt: null,
    photoUrl: null,
    lateArrivalWarningNo: null,
    ...over,
  }) as LoanDto;

describe("minutesToText", () => {
  it("formats class lengths", () => {
    expect(minutesToText(90)).toBe("1 h 30 min");
    expect(minutesToText(120)).toBe("2 h");
    expect(minutesToText(45)).toBe("45 min");
    expect(minutesToText(null)).toBeNull();
  });
});

describe("dueState", () => {
  it("counts down while the loan is out", () => {
    expect(dueState(loan(), T0)).toEqual({ kind: "due", label: "Due in 1h 45m", soon: false });
    expect(dueState(loan(), T0 + 100 * 60_000)).toMatchObject({ kind: "due", soon: true });
  });

  it("is overdue once the due time passes or the status says so", () => {
    expect(dueState(loan(), T0 + 125 * 60_000)).toEqual({ kind: "overdue", label: "Overdue 20m" });
    expect(dueState(loan({ status: "OVERDUE" }), T0)).toMatchObject({ kind: "overdue" });
  });

  it("reports late and on-time returns", () => {
    expect(dueState(loan({ status: "RETURNED", returnedAt: at(100) }), T0)).toMatchObject({ kind: "returned", late: false });
    expect(dueState(loan({ status: "RETURNED", returnedAt: at(135) }), T0)).toEqual({
      kind: "returned",
      late: true,
      label: "Returned 30m late",
    });
  });

  it("reports missing loans", () => {
    expect(dueState(loan({ status: "MISSING" }), T0).kind).toBe("missing");
  });
});

describe("buildLoanTimeline", () => {
  it("shows the arrival deadline while the asset is in transit", () => {
    const steps = buildLoanTimeline(loan(), T0 + 5 * 60_000);
    expect(steps.map((s) => [s.key, s.state])).toEqual([
      ["checkout", "done"],
      ["arrival", "upcoming"],
      ["classEnd", "upcoming"],
      ["due", "upcoming"],
    ]);
  });

  it("flags a missed arrival with the warning number", () => {
    const arrival = buildLoanTimeline(loan({ custodyState: "ANOMALY", lateArrivalWarningNo: 2 }), T0 + 20 * 60_000)[1];
    expect(arrival).toMatchObject({ key: "arrival", state: "late", hint: "Late arrival warning #2" });
  });

  it("marks an open loan past due as late", () => {
    const steps = buildLoanTimeline(loan({ status: "OVERDUE", custodyState: "VERIFIED", verifiedAt: at(6) }), T0 + 200 * 60_000);
    expect(steps.find((s) => s.key === "arrival")).toMatchObject({ label: "Verified in room", state: "done" });
    expect(steps.find((s) => s.key === "due")?.state).toBe("late");
  });

  it("ends with the return for a closed loan", () => {
    const steps = buildLoanTimeline(loan({ status: "RETURNED", verifiedAt: at(6), returnedAt: at(100) }), T0 + 300 * 60_000);
    expect(steps.at(-1)).toMatchObject({ key: "return", state: "done" });
    expect(steps.every((s) => s.state === "done")).toBe(true);
  });

  it("skips the arrival step when custody is not tracked", () => {
    const steps = buildLoanTimeline(loan({ type: "EVENT", custodyState: "NOT_REQUIRED", transitDeadlineAt: null }), T0);
    expect(steps.some((s) => s.key === "arrival")).toBe(false);
  });

  it("ends with a missing step for missing loans", () => {
    expect(buildLoanTimeline(loan({ status: "MISSING" }), T0).at(-1)).toMatchObject({ key: "return", state: "late" });
  });
});
