import { getErrorMessage } from "../components/form/FormKit";

// Problem details carry a stable `code`; branch on it rather than on the text.
export const errorCode = (error: unknown): string | undefined => {
  const err = error as { response?: { data?: { code?: unknown } } } | null;
  const code = err?.response?.data?.code;
  return typeof code === "string" ? code : undefined;
};

export const errorStatus = (error: unknown): number | undefined =>
  (error as { response?: { status?: number } } | null)?.response?.status;

const CARD_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: "User not found.",
  USER_INACTIVE: "Activate this user first.",
  CARD_OWNER_NOT_INSTRUCTOR: "Cards are only for instructors and event coordinators.",
  CARD_ENROLLMENT_NOT_FOUND: "This request is gone. Press Add card again.",
  TAG_ALREADY_ASSIGNED: "That card is already in use. Tap a different card.",
};

/** Text for an error from the Add card (kiosk) endpoints or a refused tap. */
export const cardEnrollmentMessage = (code: string | undefined, detail: string) =>
  (code && CARD_MESSAGES[code]) || detail;

export const cardErrorMessage = (error: unknown, fallback: string) =>
  cardEnrollmentMessage(errorCode(error), getErrorMessage(error, fallback));

/** PUT /auth-cards/{id} back to ACTIVE answers 409 when the UID is now active on another card. */
export const cardStatusErrorMessage = (error: unknown, fallback: string) =>
  errorCode(error) === "TAG_ALREADY_ASSIGNED"
    ? "This card UID is active on another card. Revoke that one first."
    : getErrorMessage(error, fallback);
