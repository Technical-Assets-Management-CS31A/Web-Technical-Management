import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Fingerprint, Loader2, X, XCircle } from "lucide-react";
import { useCancelKioskSession, useGetKioskSession, useStartEnrollment } from "../hooks/userHooks";
import { getErrorMessage } from "./form/FormKit";
import type { CheckoutSessionDto } from "../@types/types";

// Starts an ENROLLMENT session; the student then places a finger on the kiosk scanner.
// Templates stay on the backend; the web only sees the session status.

type EnrollFingerprintModalProps = {
  studentId: string;
  studentName: string;
  enrolledFingerCount: number;
  onClose: () => void;
};

const DONE: CheckoutSessionDto["status"][] = ["COMPLETED", "FAILED", "CANCELLED", "EXPIRED"];

export default function EnrollFingerprintModal({ studentId, studentName, enrolledFingerCount, onClose }: EnrollFingerprintModalProps) {
  const [sessionId, setSessionId] = useState("");
  const [startError, setStartError] = useState("");
  const start = useStartEnrollment();
  const cancel = useCancelKioskSession();
  const { data: session } = useQuery({
    ...useGetKioskSession(sessionId),
    refetchInterval: (query) => (query.state.data && DONE.includes(query.state.data.status) ? false : 2000),
  });

  const status = session?.status;
  const isWaiting = !!sessionId && (!status || !DONE.includes(status));

  const handleStart = () => {
    setStartError("");
    start.mutate(studentId, {
      onSuccess: (s) => setSessionId(s.id),
      onError: (err) => setStartError(getErrorMessage(err, "Could not start enrollment.")),
    });
  };

  const handleClose = () => {
    if (isWaiting) cancel.mutate(sessionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={handleClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="enroll-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 id="enroll-title" className="text-base font-semibold text-slate-900">Enroll fingerprint</h2>
            <p className="text-sm text-slate-500">{studentName} · {enrolledFingerCount} finger{enrolledFingerCount === 1 ? "" : "s"} enrolled</p>
          </div>
          <button type="button" onClick={handleClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
          {status === "COMPLETED" ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <p className="text-sm font-medium text-slate-900">Fingerprint enrolled.</p>
            </>
          ) : status && DONE.includes(status) ? (
            <>
              <XCircle className="h-12 w-12 text-rose-500" />
              <p className="text-sm font-medium text-slate-900">Enrollment {status === "FAILED" ? "failed" : status.toLowerCase()}.</p>
              {session?.failureCode && <p className="font-mono text-xs text-slate-500">{session.failureCode}</p>}
            </>
          ) : isWaiting ? (
            <>
              <span className="relative flex h-14 w-14 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-200 opacity-60" />
                <Fingerprint className="relative h-10 w-10 text-blue-600" />
              </span>
              <p className="text-sm font-medium text-slate-900">Ask the student to place a finger on the kiosk scanner.</p>
              {session?.station?.stationCode && <p className="text-xs text-slate-500">Kiosk {session.station.stationCode}</p>}
              {session?.lcdLines?.filter(Boolean).length ? (
                <pre className="mt-2 w-full rounded-lg bg-slate-900 px-3 py-2 text-left font-mono text-xs leading-5 text-emerald-300">{session.lcdLines.join("\n")}</pre>
              ) : null}
            </>
          ) : (
            <>
              <Fingerprint className="h-12 w-12 text-slate-300" />
              <p className="text-sm text-slate-600">This puts the counter kiosk into enrollment mode for this student.</p>
            </>
          )}
          {startError && <p className="text-sm text-rose-600">{startError}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
          <button type="button" onClick={handleClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            {isWaiting ? "Cancel" : "Close"}
          </button>
          {!isWaiting && status !== "COMPLETED" && (
            <button
              type="button"
              onClick={handleStart}
              disabled={start.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {start.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
              {sessionId ? "Try again" : "Start enrollment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
