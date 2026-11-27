import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Fingerprint, Loader2, X, XCircle } from "lucide-react";
import { STUDENTS_KEY, useCancelEnrollmentSession, useGetEnrollmentSession, useStartEnrollment, useStudentFingerprints } from "../hooks/userHooks";
import { useAllStations } from "../hooks/roomHooks";
import { getErrorMessage } from "./form/FormKit";
import type { EnrollmentSessionDto } from "../@types/types";

// Starts an ENROLLMENT session on a counter kiosk (FR-9.4, US-16) through the staff route
// POST /enrollment/sessions; the student then scans the finger there. Templates stay on the
// backend; the web only sees the session and which finger slots are taken.

// Backend finger slots 0–9, in the order staff usually enroll them.
const FINGERS = [
  "Right thumb", "Right index", "Right middle", "Right ring", "Right little",
  "Left thumb", "Left index", "Left middle", "Left ring", "Left little",
];

type EnrollFingerprintModalProps = {
  studentId: string;
  studentName: string;
  enrolledFingerCount: number;
  onClose: () => void;
};

const DONE: EnrollmentSessionDto["status"][] = ["COMPLETED", "FAILED", "CANCELLED", "EXPIRED"];

export default function EnrollFingerprintModal({ studentId, studentName, enrolledFingerCount, onClose }: EnrollFingerprintModalProps) {
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState("");
  const [startError, setStartError] = useState("");
  const start = useStartEnrollment();

  // Enrollment only runs on the counter kiosk; prefer one that is online.
  const { data: stations = [], isPending: stationsLoading } = useQuery(useAllStations());
  const kiosks = stations
    .filter((s) => s.type === "COUNTER_KIOSK" && !s.deletedAt)
    .sort((a, b) => Number(b.health === "ONLINE") - Number(a.health === "ONLINE") || a.stationCode.localeCompare(b.stationCode));
  const [chosenCode, setChosenCode] = useState("");
  const stationCode = chosenCode || kiosks[0]?.stationCode || "";
  const chosenKiosk = kiosks.find((k) => k.stationCode === stationCode);
  const { data: enrolled = [], isPending: fingersLoading } = useQuery(useStudentFingerprints(studentId));
  const taken = new Set(enrolled.map((f) => f.fingerIndex));
  const freeFingers = FINGERS.map((_, i) => i).filter((i) => !taken.has(i));
  const [chosenFinger, setChosenFinger] = useState<number | null>(null);
  const fingerIndex = chosenFinger !== null && !taken.has(chosenFinger) ? chosenFinger : freeFingers[0];

  const cancel = useCancelEnrollmentSession();
  const { data: session } = useQuery({
    ...useGetEnrollmentSession(sessionId),
    refetchInterval: (query) => (query.state.data && DONE.includes(query.state.data.status) ? false : 2000),
  });

  const status = session?.status;
  const isWaiting = !!sessionId && (!status || !DONE.includes(status));

  // The roster shows the enrolled-finger count, so refresh it once a finger is saved.
  useEffect(() => {
    if (status === "COMPLETED") queryClient.invalidateQueries({ queryKey: STUDENTS_KEY });
  }, [status, queryClient]);

  const handleStart = () => {
    if (!chosenKiosk || fingerIndex === undefined) return;
    setStartError("");
    start.mutate({ studentId, stationId: chosenKiosk.id, fingerIndex }, {
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
              <p className="text-sm font-medium text-slate-900">
                Ask the student to place their {FINGERS[session?.fingerIndex ?? fingerIndex ?? 0]?.toLowerCase()} on the kiosk scanner.
              </p>
              <p className="text-xs text-slate-500">
                Kiosk {stationCode}
                {session?.status === "AWAITING_CONFIRM" && " · captured, press OK on the kiosk to save"}
              </p>
            </>
          ) : (
            <>
              <Fingerprint className="h-12 w-12 text-slate-300" />
              <p className="text-sm text-slate-600">This puts the counter kiosk into enrollment mode for this student.</p>
              {stationsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-label="Loading kiosks" />
              ) : kiosks.length === 0 ? (
                <p className="text-sm text-rose-600">No counter kiosk is set up. Add one under Rooms first.</p>
              ) : (
                <label className="mt-1 flex w-full flex-col gap-1 text-left text-sm">
                  <span className="font-medium text-slate-700">Kiosk</span>
                  <select
                    value={stationCode}
                    onChange={(e) => setChosenCode(e.target.value)}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  >
                    {kiosks.map((kiosk) => (
                      <option key={kiosk.id} value={kiosk.stationCode}>
                        {kiosk.stationCode} · {kiosk.health === "ONLINE" ? "online" : kiosk.health.toLowerCase()}
                      </option>
                    ))}
                  </select>
                  {chosenKiosk && chosenKiosk.health !== "ONLINE" && (
                    <span className="flex items-center gap-1 text-xs text-amber-700">
                      <AlertTriangle className="h-3.5 w-3.5" /> This kiosk is not reporting as online.
                    </span>
                  )}
                </label>
              )}
              {kiosks.length > 0 && (
                <label className="flex w-full flex-col gap-1 text-left text-sm">
                  <span className="font-medium text-slate-700">Finger</span>
                  {fingersLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-label="Loading fingers" />
                  ) : freeFingers.length === 0 ? (
                    <span className="text-sm text-rose-600">All ten fingers are already enrolled.</span>
                  ) : (
                    <select
                      value={fingerIndex}
                      onChange={(e) => setChosenFinger(Number(e.target.value))}
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    >
                      {FINGERS.map((name, i) => (
                        <option key={i} value={i} disabled={taken.has(i)}>
                          {name}{taken.has(i) ? " · enrolled" : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
              )}
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
              disabled={start.isPending || !chosenKiosk || fingerIndex === undefined}
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
