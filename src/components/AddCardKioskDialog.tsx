import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, CreditCard, Loader2, RotateCcw, X, XCircle } from "lucide-react";
import type { CardEnrollmentDto, UserDto } from "../@types/types";
import { cancelCardEnrollmentApi } from "../api/user_api";
import { USERS_KEY, useGetCardEnrollment, useStartCardEnrollment } from "../hooks/userHooks";
import { useNow } from "../hooks/useNow";
import { cardEnrollmentMessage, cardErrorMessage, errorCode, errorStatus } from "../lib/cardErrors";
import { fullName } from "../lib/utils";
import { getToken } from "../utils/token";
import { showToast } from "./AppToast";

// Add card at the kiosk: the idle counter kiosk shows "Add card for <name>", and the next card
// tapped there is registered to this user. Only one request waits at a time, server-wide.

const POLL_MS = 1500;
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type AddCardKioskDialogProps = {
  user: Pick<UserDto, "id" | "firstName" | "lastName">;
  onClose: () => void;
};

const cancelQuietly = (id: string) => {
  cancelCardEnrollmentApi(id).catch(() => undefined);
};

// Tab closed or reloaded: axios may not finish, so send the cancel with keepalive.
const cancelOnUnload = (id: string) => {
  const token = getToken();
  fetch(`${BASE_URL}/auth-cards/enrollment/${id}/cancel`, {
    method: "POST",
    keepalive: true,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }).catch(() => undefined);
};

export default function AddCardKioskDialog({ user, onClose }: AddCardKioskDialogProps) {
  const queryClient = useQueryClient();
  const start = useStartCardEnrollment();
  const [enrollmentId, setEnrollmentId] = useState("");
  const [startError, setStartError] = useState("");
  const now = useNow(1000);
  const name = fullName(user);

  const { data: enrollment, error: pollError } = useQuery({
    ...useGetCardEnrollment(enrollmentId),
    refetchInterval: (query) => (query.state.error || (query.state.data && query.state.data.status !== "WAITING") ? false : POLL_MS),
  });

  const status = enrollment?.status;
  const isGone = !!pollError && (errorStatus(pollError) === 404 || errorCode(pollError) === "CARD_ENROLLMENT_NOT_FOUND");
  const isWaiting = !!enrollmentId && status === "WAITING" && !pollError;

  // What a later unmount or tab close needs to know, without re-running effects.
  const mounted = useRef(true);
  const waitingId = useRef("");
  waitingId.current = isWaiting ? enrollmentId : "";

  const begin = useCallback(() => {
    setStartError("");
    setEnrollmentId("");
    // mutateAsync, not mutate: its promise still settles if the dialog closed meanwhile.
    start.mutateAsync(user.id).then(
      (e: CardEnrollmentDto) => {
        if (!mounted.current) {
          if (e.status === "WAITING") cancelQuietly(e.id);
          return;
        }
        queryClient.setQueryData(["card-enrollment", e.id], e);
        setEnrollmentId(e.id);
      },
      (err) => {
        if (mounted.current) setStartError(cardErrorMessage(err, "Could not start Add card."));
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, queryClient]);

  // Start as soon as the dialog opens. The ref keeps StrictMode's double effect from starting twice.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    begin();
  }, [begin]);

  // Closing the dialog or leaving the page puts the kiosk back to normal.
  useEffect(() => {
    mounted.current = true;
    const onPageHide = () => {
      if (waitingId.current) cancelOnUnload(waitingId.current);
    };
    window.addEventListener("pagehide", onPageHide);
    return () => {
      mounted.current = false;
      window.removeEventListener("pagehide", onPageHide);
      if (waitingId.current) cancelQuietly(waitingId.current);
    };
  }, []);

  // Done: refresh the users so authCards shows the new card.
  useEffect(() => {
    if (status !== "COMPLETED") return;
    queryClient.invalidateQueries({ queryKey: USERS_KEY });
    const uid = enrollment?.card?.cardUid;
    showToast.success("Card Registered", `${uid ? `Card ${uid}` : "The card"} is now active for ${name}.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Another Add card replaced this one (only one waits at a time), or it was cancelled elsewhere.
  useEffect(() => {
    if (status !== "CANCELLED") return;
    showToast.info("Add Card Cancelled", `The request for ${name} was cancelled or replaced by another Add card.`);
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleClose = () => {
    if (waitingId.current) {
      cancelQuietly(waitingId.current);
      waitingId.current = "";
    }
    onClose();
  };

  const secondsLeft = enrollment ? Math.max(0, Math.ceil((Date.parse(enrollment.expiresAt) - now) / 1000)) : 0;
  const tapError = isWaiting && enrollment?.lastError
    ? cardEnrollmentMessage(enrollment.lastError.code, enrollment.lastError.detail)
    : "";
  const canRetry = !start.isPending && (status === "EXPIRED" || isGone || !!startError || (!!pollError && !isGone));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={handleClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-card-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="min-w-0">
            <h2 id="add-card-title" className="text-base font-semibold text-slate-900">Add card</h2>
            <p className="truncate text-sm text-slate-500">{name}</p>
          </div>
          <button type="button" onClick={handleClose} aria-label="Close" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 px-6 py-8 text-center" aria-live="polite">
          {status === "COMPLETED" ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <p className="text-sm font-medium text-slate-900">Card registered</p>
              {enrollment?.card && <p className="font-mono text-sm text-slate-600">{enrollment.card.cardUid}</p>}
            </>
          ) : status === "EXPIRED" ? (
            <>
              <XCircle className="h-12 w-12 text-rose-500" />
              <p className="text-sm font-medium text-slate-900">No card was tapped in time.</p>
            </>
          ) : isGone ? (
            <>
              <XCircle className="h-12 w-12 text-rose-500" />
              <p className="text-sm font-medium text-slate-900">This request is gone. Press Try again.</p>
            </>
          ) : pollError ? (
            <>
              <AlertTriangle className="h-12 w-12 text-amber-500" />
              <p className="text-sm font-medium text-slate-900">{cardErrorMessage(pollError, "Lost contact with the server.")}</p>
            </>
          ) : startError ? (
            <>
              <XCircle className="h-12 w-12 text-rose-500" />
              <p className="text-sm font-medium text-slate-900">{startError}</p>
            </>
          ) : isWaiting ? (
            <>
              <span className="relative flex h-14 w-14 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-200 opacity-60" />
                <CreditCard className="relative h-10 w-10 text-blue-600" />
              </span>
              <p className="text-sm font-medium text-slate-900">Tap the new card on the counter kiosk.</p>
              <p className="text-xs text-slate-500 tabular-nums">
                Any idle counter kiosk · {secondsLeft}s left
              </p>
              {tapError && (
                <p className="mt-1 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-left text-sm text-amber-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  {tapError}
                </p>
              )}
            </>
          ) : (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-label="Starting" />
              <p className="text-sm text-slate-600">Sending the request to the kiosk…</p>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
          <button type="button" onClick={handleClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            {status === "COMPLETED" ? "Done" : isWaiting || start.isPending ? "Cancel" : "Close"}
          </button>
          {canRetry && (
            <button
              type="button"
              onClick={begin}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <RotateCcw className="h-4 w-4" />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
