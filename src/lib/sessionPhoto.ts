import type { CheckoutSessionDto } from "../@types/types";

// Photo step of the kiosk checkout (PRD 4 F1 step 5): the counter webcam captures and uploads the
// borrower's photo, with one automatic retry. If it still fails the borrow is denied with "Camera error".

/** First try plus one automatic retry. */
export const PHOTO_MAX_ATTEMPTS = 2;
export const PHOTO_RETRY_DELAY_MS = 1000;
export const PHOTO_FAILURE_CODE = "PHOTO_FAILED";
/** Reason the kiosk LCD shows on the Denied screen. */
export const CAMERA_ERROR_REASON = "Camera error";

/** A checkout session waiting for its photo. */
export const needsPhoto = (session: CheckoutSessionDto) =>
  session.type === "CHECKOUT" && session.status === "AWAITING_PHOTO" && !session.photoUrl;

const byOldest = (a: CheckoutSessionDto, b: CheckoutSessionDto) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

/** The session the webcam should shoot next: the oldest one waiting for a photo. */
export const pickPhotoSession = (sessions: CheckoutSessionDto[]) => [...sessions].filter(needsPhoto).sort(byOldest)[0] ?? null;

/** The checkout session to show on the counter webcam page: the one at the photo step, else the oldest active one. */
export const pickWatchedSession = (sessions: CheckoutSessionDto[]) =>
  pickPhotoSession(sessions) ?? [...sessions].filter((s) => s.type === "CHECKOUT").sort(byOldest)[0] ?? null;

export type PhotoStepOutcome =
  | { kind: "uploaded"; attempts: number }
  | { kind: "denied"; error: unknown }
  | { kind: "denyFailed"; error: unknown; denyError: unknown }
  | { kind: "aborted" };

type RunPhotoStepOptions = {
  /** One capture + upload. Throws on failure. */
  attempt: (attemptNo: number) => Promise<void>;
  /** Fails the session with PHOTO_FAILED / "Camera error". */
  deny: () => Promise<void>;
  /** False once the session left the photo step (expired, cancelled, photo arrived), so we stop quietly. */
  isStillNeeded?: () => boolean;
  onAttemptFailed?: (attemptNo: number, error: unknown) => void;
  maxAttempts?: number;
  retryDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
};

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function runPhotoStep({
  attempt,
  deny,
  isStillNeeded = () => true,
  onAttemptFailed,
  maxAttempts = PHOTO_MAX_ATTEMPTS,
  retryDelayMs = PHOTO_RETRY_DELAY_MS,
  sleep = defaultSleep,
}: RunPhotoStepOptions): Promise<PhotoStepOutcome> {
  let lastError: unknown = null;

  for (let n = 1; n <= maxAttempts; n++) {
    try {
      await attempt(n);
      return { kind: "uploaded", attempts: n };
    } catch (err) {
      lastError = err;
      onAttemptFailed?.(n, err);
    }
    if (!isStillNeeded()) return { kind: "aborted" };
    if (n < maxAttempts && retryDelayMs > 0) {
      await sleep(retryDelayMs);
      if (!isStillNeeded()) return { kind: "aborted" };
    }
  }

  try {
    await deny();
    return { kind: "denied", error: lastError };
  } catch (denyError) {
    return { kind: "denyFailed", error: lastError, denyError };
  }
}
