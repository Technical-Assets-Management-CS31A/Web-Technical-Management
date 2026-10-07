import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Nfc, RotateCcw, XCircle } from "lucide-react";

// RFID registration session used by the item and student edit forms.
// Timers and the live session id live in refs so callbacks never act on stale values,
// and a pending session is cancelled on the server if the form closes mid-scan.

export type RfidStatus = "idle" | "starting" | "waiting" | "completed" | "expired" | "error";

type BaseSession = { id: string; status: string; expiresAt: string };

type UseRfidSessionOptions<S extends BaseSession> = {
  createSession: () => Promise<S>;
  fetchSession: (sessionId: string) => Promise<S>;
  cancelSession: (sessionId: string) => Promise<unknown>;
  /** Keep retrying session creation (e.g. while the reader comes online) */
  retryCreate?: boolean;
  onCompleted?: (session: S) => void;
};

const POLL_MS = 2000;
const MAX_CREATE_ATTEMPTS = 30; // ~1 minute of retries

export function useRfidSession<S extends BaseSession>(options: UseRfidSessionOptions<S>) {
  const [status, setStatus] = useState<RfidStatus>("idle");
  const [session, setSession] = useState<S | null>(null);

  const optionsRef = useRef(options);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const runRef = useRef(0); // bumps on start/cancel so late responses from old runs are ignored

  useEffect(() => {
    optionsRef.current = options;
  });

  const clearTimers = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (retryRef.current) clearTimeout(retryRef.current);
    pollRef.current = null;
    retryRef.current = null;
  }, []);

  const startPolling = useCallback(
    (sessionId: string, run: number) => {
      pollRef.current = setInterval(async () => {
        try {
          const latest = await optionsRef.current.fetchSession(sessionId);
          if (run !== runRef.current) return;
          setSession(latest);
          if (latest.status === "Completed") {
            clearTimers();
            activeIdRef.current = null;
            setStatus("completed");
            optionsRef.current.onCompleted?.(latest);
          } else if (latest.status === "Expired" || latest.status === "Cancelled") {
            clearTimers();
            activeIdRef.current = null;
            setStatus("expired");
          } else if (latest.status === "Failed") {
            clearTimers();
            activeIdRef.current = null;
            setStatus("error");
          }
        } catch {
          // Network hiccup — keep polling until the session resolves or expires
        }
      }, POLL_MS);
    },
    [clearTimers],
  );

  const start = useCallback(() => {
    clearTimers();
    const run = ++runRef.current;
    let attempts = 0;
    setSession(null);
    setStatus("starting");

    const attempt = async () => {
      attempts++;
      try {
        const created = await optionsRef.current.createSession();
        if (run !== runRef.current) {
          // Cancelled or restarted while this request was in flight
          optionsRef.current.cancelSession(created.id).catch(() => {});
          return;
        }
        activeIdRef.current = created.id;
        setSession(created);
        setStatus("waiting");
        startPolling(created.id, run);
      } catch {
        if (run !== runRef.current) return;
        if (optionsRef.current.retryCreate && attempts < MAX_CREATE_ATTEMPTS) {
          retryRef.current = setTimeout(attempt, POLL_MS);
        } else {
          setStatus("error");
        }
      }
    };

    attempt();
  }, [clearTimers, startPolling]);

  const cancel = useCallback(() => {
    runRef.current++;
    clearTimers();
    if (activeIdRef.current) {
      optionsRef.current.cancelSession(activeIdRef.current).catch(() => {});
      activeIdRef.current = null;
    }
    setSession(null);
    setStatus("idle");
  }, [clearTimers]);

  // On unmount: stop timers and release any session still waiting for a scan
  useEffect(
    () => () => {
      runRef.current++;
      clearTimers();
      if (activeIdRef.current) optionsRef.current.cancelSession(activeIdRef.current).catch(() => {});
    },
    [clearTimers],
  );

  const isActive = status === "starting" || status === "waiting";
  return { status, session, isActive, start, cancel };
}

type RfidRegistrationPanelProps = {
  /** "tag" for items, "card" for students */
  noun: string;
  subject: string;
  currentUid?: string | null;
  status: RfidStatus;
  expiresAt?: string | null;
  waitingHint: string;
  onStart: () => void;
  onCancel: () => void;
};

export function RfidRegistrationPanel({
  noun,
  subject,
  currentUid,
  status,
  expiresAt,
  waitingHint,
  onStart,
  onCancel,
}: RfidRegistrationPanelProps) {
  const isActive = status === "starting" || status === "waiting";
  const Noun = noun.charAt(0).toUpperCase() + noun.slice(1);

  const content: Record<RfidStatus, { title: string; text: string }> = {
    idle: {
      title: currentUid ? `${Noun} assigned` : `No ${noun} assigned`,
      text: currentUid
        ? `Start a session to replace the current ${noun}.`
        : `Start a session to assign an RFID ${noun} to this ${subject}.`,
    },
    starting: { title: "Connecting to the reader…", text: "Setting up a registration session." },
    waiting: {
      title: `Waiting for ${noun} tap…`,
      text: expiresAt ? `${waitingHint} Expires at ${new Date(expiresAt).toLocaleTimeString()}.` : waitingHint,
    },
    completed: { title: `RFID ${noun} registered`, text: `The ${noun} is now assigned to this ${subject}.` },
    expired: { title: "Session expired", text: "No scan was received in time. Start a new session." },
    error: { title: "Couldn't start the session", text: "Check that the reader is online, then try again." },
  };

  const icon =
    status === "completed" ? (
      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
    ) : status === "expired" || status === "error" ? (
      <XCircle className="h-5 w-5 text-rose-500" />
    ) : isActive ? (
      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
    ) : (
      <Nfc className="h-5 w-5 text-slate-500" />
    );

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          {status === "waiting" && <span className="absolute inset-0 animate-ping rounded-lg bg-blue-400/20" />}
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">{content[status].title}</p>
          <p className="mt-0.5 text-sm text-slate-500">{content[status].text}</p>
          {currentUid && status !== "completed" && (
            <p className="mt-1.5 inline-flex max-w-full items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
              <span className="truncate">{currentUid}</span>
            </p>
          )}
        </div>
      </div>

      {status !== "completed" &&
        (isActive ? (
          <button
            type="button"
            onClick={onCancel}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            Cancel scan
          </button>
        ) : (
          <button
            type="button"
            onClick={onStart}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            {status === "idle" ? <Nfc className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
            {status === "idle" ? (currentUid ? `Replace ${noun}` : `Register ${noun}`) : "Try again"}
          </button>
        ))}
    </div>
  );
}
