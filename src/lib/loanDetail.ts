import type { LoanDto } from "../@types/types";
import { formatDuration } from "./loanFilters";

// Pure helpers for the Loan detail page (PRD 6.5). Kept out of the component so they can be unit tested.

/** 90 → "1 h 30 min", 120 → "2 h". */
export const minutesToText = (minutes: number | null | undefined) => {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
};

const ms = (iso: string | null | undefined) => {
  const t = iso ? new Date(iso).getTime() : NaN;
  return Number.isFinite(t) ? t : null;
};

export type DueState =
  | { kind: "due"; label: string; soon: boolean }
  | { kind: "overdue"; label: string }
  | { kind: "returned"; label: string; late: boolean }
  | { kind: "missing"; label: string };

const DUE_SOON_MS = 15 * 60_000;

/** What the due card should say for this loan at time `now`. */
export const dueState = (loan: LoanDto, now: number): DueState => {
  const due = ms(loan.dueAt);
  if (loan.status === "MISSING") return { kind: "missing", label: "Declared missing" };
  if (loan.status === "RETURNED") {
    const returned = ms(loan.returnedAt);
    const late = due !== null && returned !== null && returned > due;
    return {
      kind: "returned",
      late,
      label: late && returned !== null && due !== null ? `Returned ${formatDuration(returned - due)} late` : "Returned on time",
    };
  }
  if (due === null) return { kind: "due", label: "No due time", soon: false };
  const left = due - now;
  if (loan.status === "OVERDUE" || left < 0) return { kind: "overdue", label: `Overdue ${formatDuration(left)}` };
  return { kind: "due", label: `Due in ${formatDuration(left)}`, soon: left < DUE_SOON_MS };
};

export type TimelineStep = {
  key: string;
  label: string;
  at: string | null;
  /** "done" happened, "late" passed without the expected event, "upcoming" still ahead */
  state: "done" | "late" | "upcoming";
  hint?: string;
};

/** Checkout → arrival in room → class end → due → return, as far as this loan has got. */
export const buildLoanTimeline = (loan: LoanDto, now: number): TimelineStep[] => {
  const open = loan.status === "ACTIVE" || loan.status === "OVERDUE";
  const passed = (iso: string | null) => {
    const t = ms(iso);
    return t !== null && t <= now;
  };

  const steps: TimelineStep[] = [{ key: "checkout", label: "Checked out at the kiosk", at: loan.checkedOutAt, state: "done" }];

  if (loan.custodyState !== "NOT_REQUIRED") {
    if (loan.verifiedAt) {
      steps.push({ key: "arrival", label: "Verified in room", at: loan.verifiedAt, state: "done" });
    } else if (loan.transitDeadlineAt) {
      const late = loan.custodyState === "ANOMALY" || passed(loan.transitDeadlineAt);
      steps.push({
        key: "arrival",
        label: late ? "Not verified in room" : "Arrive in room by",
        at: loan.transitDeadlineAt,
        state: late ? "late" : "upcoming",
        hint: loan.lateArrivalWarningNo ? `Late arrival warning #${loan.lateArrivalWarningNo}` : undefined,
      });
    }
  }

  steps.push({ key: "classEnd", label: "Class ends", at: loan.classEndsAt, state: passed(loan.classEndsAt) ? "done" : "upcoming" });

  const duePassed = passed(loan.dueAt);
  steps.push({
    key: "due",
    label: `Due back (${loan.graceMinutes} min grace)`,
    at: loan.dueAt,
    state: open && duePassed ? "late" : duePassed || !open ? "done" : "upcoming",
  });

  if (loan.returnedAt) steps.push({ key: "return", label: "Returned at the kiosk", at: loan.returnedAt, state: "done" });
  else if (loan.status === "MISSING") steps.push({ key: "return", label: "Declared missing", at: null, state: "late" });

  return steps;
};
