import { describe, expect, it } from "vitest";
import type { CheckoutSessionDto } from "../../@types/types";
import {
  currentStepIndex,
  denialReason,
  describeSession,
  pickDisplaySession,
  secondsLeft,
  stepsFor,
  toLcdLines,
} from "../kioskDisplay";

const session = (over: Partial<CheckoutSessionDto> & { id: string }): CheckoutSessionDto =>
  ({
    type: "CHECKOUT",
    status: "AWAITING_FINGERPRINT",
    station: { id: "st1", stationCode: "KIOSK-01" },
    instructor: { id: "i1", fullName: "L. Santos" },
    student: { id: "s1", fullName: "Paolo R." },
    asset: null,
    photoUrl: null,
    destinationRoom: null,
    classLengthMinutes: null,
    fingerprintAttempts: 0,
    lcdLines: ["", "", "", ""],
    failureCode: null,
    loanId: null,
    eventId: null,
    createdAt: "2026-11-13T08:00:00Z",
    expiresAt: "2026-11-13T08:01:00Z",
    completedAt: null,
    ...over,
  }) as CheckoutSessionDto;

describe("toLcdLines", () => {
  it("always returns 4 lines of 20 characters", () => {
    const lines = toLcdLines(["Borrowed! Tap item at the room door", "x"]);
    expect(lines).toHaveLength(4);
    expect(lines.every((l) => l.length === 20)).toBe(true);
    expect(lines[0]).toBe("Borrowed! Tap item a");
    expect(lines[3]).toBe(" ".repeat(20));
    expect(toLcdLines(null)).toHaveLength(4);
  });
});

describe("pickDisplaySession", () => {
  const sessions = [
    session({ id: "old", createdAt: "2026-11-13T08:00:00Z" }),
    session({ id: "new", createdAt: "2026-11-13T08:05:00Z" }),
    session({ id: "other", createdAt: "2026-11-13T08:10:00Z", station: { id: "st2", stationCode: "KIOSK-02" } }),
    session({ id: "enroll", type: "ENROLLMENT", createdAt: "2026-11-13T09:00:00Z" }),
    session({ id: "done", status: "COMPLETED", createdAt: "2026-11-13T09:00:00Z" }),
  ];

  it("shows the newest running counter session", () => {
    expect(pickDisplaySession(sessions)?.id).toBe("other");
  });

  it("filters by station", () => {
    expect(pickDisplaySession(sessions, "KIOSK-01")?.id).toBe("new");
    expect(pickDisplaySession(sessions, "KIOSK-09")).toBeNull();
  });
});

describe("steps", () => {
  it("tracks the checkout step, all done when completed", () => {
    expect(currentStepIndex(session({ id: "1", status: "AWAITING_PHOTO" }))).toBe(3);
    expect(currentStepIndex(session({ id: "1", status: "COMPLETED" }))).toBe(stepsFor("CHECKOUT").length);
  });

  it("returns skip the approval step", () => {
    expect(stepsFor("RETURN").map((s) => s.status)).not.toContain("AWAITING_APPROVAL");
  });
});

describe("results", () => {
  it("prefers the LCD reason for a denied session", () => {
    expect(denialReason(session({ id: "1", status: "FAILED", lcdLines: ["Camera error", "Borrow denied", "See lab staff", ""] }))).toBe("Camera error");
  });

  it("falls back to the failure code", () => {
    expect(denialReason(session({ id: "1", status: "FAILED", failureCode: "STUDENT_BLOCKED" }))).toBe("Borrowing blocked");
    expect(denialReason(session({ id: "1", status: "FAILED", failureCode: "TAG_UNKNOWN" }))).toBe("Tag Unknown");
    expect(denialReason(session({ id: "1", status: "FAILED" }))).toBe("Borrow denied");
  });

  it("describes each outcome", () => {
    expect(describeSession(session({ id: "1", status: "AWAITING_CONFIRM" }))).toMatchObject({ tone: "action" });
    expect(describeSession(session({ id: "1", status: "COMPLETED" }))).toMatchObject({ tone: "success", title: "Borrowed!" });
    expect(describeSession(session({ id: "1", status: "DECLINED" }))).toMatchObject({ tone: "declined" });
    expect(describeSession(session({ id: "1", status: "FAILED", failureCode: "PHOTO_FAILED" }))).toMatchObject({
      tone: "denied",
      title: "Camera error",
    });
    expect(describeSession(session({ id: "1", type: "RETURN", status: "COMPLETED" })).title).toBe("Returned");
  });
});

describe("secondsLeft", () => {
  it("counts down to expiry and stops at zero", () => {
    const s = session({ id: "1" });
    expect(secondsLeft(s, Date.parse("2026-11-13T08:00:30Z"))).toBe(30);
    expect(secondsLeft(s, Date.parse("2026-11-13T08:05:00Z"))).toBe(0);
    expect(secondsLeft(session({ id: "1", status: "COMPLETED" }), 0)).toBeNull();
  });
});
