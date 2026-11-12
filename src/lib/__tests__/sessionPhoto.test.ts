import { describe, expect, it, vi } from "vitest";
import type { CheckoutSessionDto } from "../../@types/types";
import { needsPhoto, pickPhotoSession, pickWatchedSession, runPhotoStep } from "../sessionPhoto";

const session = (over: Partial<CheckoutSessionDto> & { id: string }): CheckoutSessionDto =>
  ({
    type: "CHECKOUT",
    status: "AWAITING_PHOTO",
    station: { id: "st1", stationCode: "COUNTER-1" },
    instructor: null,
    student: null,
    asset: null,
    photoUrl: null,
    destinationRoom: null,
    classLengthMinutes: null,
    fingerprintAttempts: 0,
    lcdLines: ["", "", "", ""],
    failureCode: null,
    loanId: null,
    eventId: null,
    createdAt: "2026-11-12T08:00:00Z",
    expiresAt: "2026-11-12T08:01:00Z",
    completedAt: null,
    ...over,
  }) as CheckoutSessionDto;

const noSleep = () => Promise.resolve();

describe("session picking", () => {
  it("only checkout sessions at the photo step without a photo need one", () => {
    expect(needsPhoto(session({ id: "1" }))).toBe(true);
    expect(needsPhoto(session({ id: "2", photoUrl: "x.jpg" }))).toBe(false);
    expect(needsPhoto(session({ id: "3", status: "AWAITING_ASSET" }))).toBe(false);
    expect(needsPhoto(session({ id: "4", type: "RETURN" }))).toBe(false);
  });

  it("shoots the oldest waiting session first", () => {
    const sessions = [
      session({ id: "new", createdAt: "2026-11-12T08:05:00Z" }),
      session({ id: "old", createdAt: "2026-11-12T08:01:00Z" }),
      session({ id: "earlier-step", status: "AWAITING_FINGERPRINT", createdAt: "2026-11-12T07:00:00Z" }),
    ];
    expect(pickPhotoSession(sessions)?.id).toBe("old");
    expect(pickPhotoSession([])).toBeNull();
  });

  it("watches the photo session, else the oldest checkout", () => {
    const waiting = session({ id: "w", status: "AWAITING_ASSET" });
    expect(pickWatchedSession([waiting])?.id).toBe("w");
    expect(pickWatchedSession([waiting, session({ id: "p", createdAt: "2026-11-12T09:00:00Z" })])?.id).toBe("p");
    expect(pickWatchedSession([session({ id: "r", type: "RETURN" })])).toBeNull();
  });
});

describe("runPhotoStep", () => {
  it("uploads on the first try", async () => {
    const attempt = vi.fn().mockResolvedValue(undefined);
    const deny = vi.fn();
    await expect(runPhotoStep({ attempt, deny, sleep: noSleep })).resolves.toEqual({ kind: "uploaded", attempts: 1 });
    expect(attempt).toHaveBeenCalledTimes(1);
    expect(deny).not.toHaveBeenCalled();
  });

  it("retries once automatically", async () => {
    const attempt = vi.fn().mockRejectedValueOnce(new Error("blurry")).mockResolvedValueOnce(undefined);
    const onAttemptFailed = vi.fn();
    const sleep = vi.fn(noSleep);
    const result = await runPhotoStep({ attempt, deny: vi.fn(), onAttemptFailed, sleep, retryDelayMs: 500 });
    expect(result).toEqual({ kind: "uploaded", attempts: 2 });
    expect(attempt).toHaveBeenNthCalledWith(2, 2);
    expect(onAttemptFailed).toHaveBeenCalledWith(1, expect.any(Error));
    expect(sleep).toHaveBeenCalledWith(500);
  });

  it("denies the borrow after the retry also fails", async () => {
    const err = new Error("upload 500");
    const attempt = vi.fn().mockRejectedValue(err);
    const deny = vi.fn().mockResolvedValue(undefined);
    await expect(runPhotoStep({ attempt, deny, sleep: noSleep })).resolves.toEqual({ kind: "denied", error: err });
    expect(attempt).toHaveBeenCalledTimes(2);
    expect(deny).toHaveBeenCalledTimes(1);
  });

  it("reports when the deny call itself fails", async () => {
    const denyError = new Error("offline");
    const result = await runPhotoStep({
      attempt: vi.fn().mockRejectedValue(new Error("no camera")),
      deny: vi.fn().mockRejectedValue(denyError),
      sleep: noSleep,
    });
    expect(result).toMatchObject({ kind: "denyFailed", denyError });
  });

  it("stops quietly once the session leaves the photo step", async () => {
    const attempt = vi.fn().mockRejectedValue(new Error("x"));
    const deny = vi.fn();
    const result = await runPhotoStep({ attempt, deny, isStillNeeded: () => false, sleep: noSleep });
    expect(result).toEqual({ kind: "aborted" });
    expect(attempt).toHaveBeenCalledTimes(1);
    expect(deny).not.toHaveBeenCalled();
  });
});
