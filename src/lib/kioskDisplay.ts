import type { CheckoutSessionDto, SessionStatus, SessionType } from "../@types/types";
import { formatEnum } from "./utils";

// Pure helpers for the kiosk confirmation view on the counter computer (PRD 6.2, 6.7).
// The view mirrors the 20x4 LCD and spells out the current step or the final result.

export const LCD_COLS = 20;
export const LCD_ROWS = 4;
/** How long a finished session's result stays on screen before going back to idle. */
export const RESULT_HOLD_MS = 15_000;

/** PRD 6.7 Idle screen, shown when no session is running. */
export const IDLE_LCD = ["TAMS Counter", "Tap auth card", "or scan finger to", "return an item"];

export const TERMINAL_STATUSES: SessionStatus[] = ["COMPLETED", "DECLINED", "CANCELLED", "EXPIRED", "FAILED"];
export const isTerminal = (status: SessionStatus) => TERMINAL_STATUSES.includes(status);

/** Session types the counter kiosk runs (enrollment happens elsewhere). */
const COUNTER_TYPES: SessionType[] = ["CHECKOUT", "RETURN", "EVENT_BATCH", "EVENT_RETURN"];
export const isCounterSession = (s: CheckoutSessionDto) => COUNTER_TYPES.includes(s.type);

/** Always exactly 4 lines of 20 characters, like the physical LCD2004. */
export const toLcdLines = (lines: readonly (string | null | undefined)[] | null | undefined): string[] =>
  Array.from({ length: LCD_ROWS }, (_, i) => (lines?.[i] ?? "").replace(/\s+$/, "").slice(0, LCD_COLS).padEnd(LCD_COLS, " "));

/** The session to show for a station: the newest running one. */
export const pickDisplaySession = (sessions: CheckoutSessionDto[], stationCode?: string) =>
  [...sessions]
    .filter((s) => isCounterSession(s) && !isTerminal(s.status) && (!stationCode || s.station.stationCode === stationCode))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null;

// ── Steps ────────────────────────────────────────────────────────────────────

export type DisplayStep = { status: SessionStatus | "CARD"; label: string };

const CHECKOUT_STEPS: DisplayStep[] = [
  { status: "CARD", label: "Card" },
  { status: "AWAITING_FINGERPRINT", label: "Fingerprint" },
  { status: "AWAITING_ASSET", label: "Item tag" },
  { status: "AWAITING_PHOTO", label: "Photo" },
  { status: "AWAITING_APPROVAL", label: "Approval" },
  { status: "AWAITING_CONFIRM", label: "Confirm" },
];

// Returns use the same pattern without the approval step (PRD 6.2).
const RETURN_STEPS: DisplayStep[] = [
  { status: "AWAITING_FINGERPRINT", label: "Fingerprint" },
  { status: "AWAITING_ASSET", label: "Item tag" },
  { status: "AWAITING_CONFIRM", label: "Confirm" },
];

export const stepsFor = (type: SessionType) => (type === "RETURN" || type === "EVENT_RETURN" ? RETURN_STEPS : CHECKOUT_STEPS);

/** Index of the current step; terminal sessions count every step as passed only when COMPLETED. */
export const currentStepIndex = (session: CheckoutSessionDto) => {
  const steps = stepsFor(session.type);
  if (session.status === "COMPLETED") return steps.length;
  return steps.findIndex((s) => s.status === session.status);
};

// ── Results ──────────────────────────────────────────────────────────────────

const FAILURE_REASONS: Record<string, string> = {
  PHOTO_FAILED: "Camera error",
  STUDENT_BLOCKED: "Borrowing blocked",
  INSTRUCTOR_FROZEN: "Instructor account frozen",
  ASSET_NOT_AVAILABLE: "Item not available",
};

/**
 * Why a session was denied. The LCD's first line carries the reason on the Denied screen
 * (PRD 6.7), so it wins; otherwise the failure code is translated.
 */
export const denialReason = (session: CheckoutSessionDto) => {
  const lcd = session.lcdLines?.[0]?.trim();
  if (lcd && !/^borrow denied$/i.test(lcd)) return lcd;
  if (session.failureCode) return FAILURE_REASONS[session.failureCode] ?? formatEnum(session.failureCode);
  return "Borrow denied";
};

export type DisplayTone = "progress" | "action" | "success" | "declined" | "denied" | "neutral";

export type DisplayState = {
  tone: DisplayTone;
  title: string;
  detail: string;
};

const isReturn = (s: CheckoutSessionDto) => s.type === "RETURN" || s.type === "EVENT_RETURN";

/** Headline for the big panel: what the borrower should do now, or how the session ended. */
export const describeSession = (session: CheckoutSessionDto): DisplayState => {
  const student = session.student?.fullName ?? "the student";
  switch (session.status) {
    case "AWAITING_FINGERPRINT":
      return { tone: "progress", title: "Scan fingerprint", detail: `${student === "the student" ? "Student" : student}, place your finger on the sensor.` };
    case "AWAITING_ASSET":
      return { tone: "progress", title: "Tap the item tag", detail: "Hold the item's RFID tag to the reader." };
    case "AWAITING_PHOTO":
      return { tone: "progress", title: "Taking photo", detail: "Look at the counter webcam." };
    case "AWAITING_APPROVAL":
      return {
        tone: "progress",
        title: "Waiting for instructor approval",
        detail: `${session.instructor?.fullName ?? "The instructor"} approves on the TAMS mobile app.`,
      };
    case "AWAITING_CONFIRM":
      return isReturn(session)
        ? { tone: "action", title: "Confirm the return", detail: "Press OK to confirm or X to cancel." }
        : { tone: "action", title: "Approved. Confirm the borrow", detail: "Check the details, then press OK to confirm or X to cancel." };
    case "COMPLETED":
      return isReturn(session)
        ? { tone: "success", title: "Returned", detail: "The item is checked back in." }
        : { tone: "success", title: "Borrowed!", detail: "Tap the item at the room door within 10 minutes." };
    case "DECLINED":
      return { tone: "declined", title: "Declined by instructor", detail: "The instructor did not approve this borrow." };
    case "CANCELLED":
      return { tone: "neutral", title: "Cancelled", detail: "The borrower pressed Cancel. Nothing was borrowed." };
    case "EXPIRED":
      return { tone: "declined", title: "Session expired", detail: "A step or the approval timed out. Start again with the card." };
    case "FAILED":
      return { tone: "denied", title: denialReason(session), detail: "Borrow denied. See lab staff." };
    default:
      return { tone: "neutral", title: formatEnum(session.status), detail: "" };
  }
};

/** Seconds left before the session expires, or null when not relevant. */
export const secondsLeft = (session: CheckoutSessionDto, now: number) => {
  if (isTerminal(session.status)) return null;
  const t = new Date(session.expiresAt).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.max(0, Math.ceil((t - now) / 1000));
};
