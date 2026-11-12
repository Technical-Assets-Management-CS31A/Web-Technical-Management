import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CheckoutSessionDto } from "../@types/types";
import { useActiveKioskSessions, useKioskSession } from "./loanHooks";
import { endedDeadline, endedPhase, findEnded, isTerminal, pickDisplaySession, type EndedSession } from "../lib/kioskDisplay";

// Drives the kiosk confirmation view. The active list (polled every 2 s) drops a session as soon as it
// ends, so when the watched session disappears we read it by id (GET /kiosk/sessions/{id}) and hold its
// result (completed, declined, denied...) on screen for RESULT_HOLD_MS from the moment it was read.
// If the read keeps failing we give up after RESULT_CHECK_TIMEOUT_MS and stop polling.

export type KioskDisplay =
  | { kind: "idle" }
  | { kind: "running"; session: CheckoutSessionDto }
  | { kind: "result"; session: CheckoutSessionDto }
  /** Ended, final status not read yet (or the read failed): last known session */
  | { kind: "ending"; session: CheckoutSessionDto; failed: boolean };

export function useKioskDisplay(stationCode?: string) {
  const sessionsQuery = useQuery(useActiveKioskSessions());
  const sessions = useMemo(() => (Array.isArray(sessionsQuery.data) ? sessionsQuery.data : []), [sessionsQuery.data]);
  const running = pickDisplaySession(sessions, stationCode);

  // The session currently on screen, so we notice when it leaves the active list,
  // even if another session replaced it in the same poll.
  const watched = useRef<CheckoutSessionDto | null>(null);
  const [ended, setEnded] = useState<EndedSession | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // 1 s tick for the expiry countdown and the result hold.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Changing station starts over.
  useEffect(() => {
    watched.current = null;
    setEnded(null);
  }, [stationCode]);

  // Only react to successful polls, so a network blip doesn't end a session early.
  useEffect(() => {
    if (!sessionsQuery.isSuccess) return;
    const justEnded = findEnded(watched.current, sessions);
    if (justEnded) setEnded({ session: justEnded, endedAt: Date.now(), resultAt: null });
    watched.current = running;
  }, [sessions, running, sessionsQuery.isSuccess]);

  const phase = ended ? endedPhase(ended, now) : "done";

  // Drop the held result once its time is up; this also disables the result query below.
  useEffect(() => {
    if (ended && phase === "done") setEnded(null);
  }, [ended, phase]);

  const finalQuery = useQuery({
    ...useKioskSession(ended && phase !== "done" ? ended.session.id : null),
    retry: false,
    // The backend may take a moment to settle the final status; stop once it has.
    refetchInterval: (query) => (query.state.data && isTerminal(query.state.data.status) ? false : 2000),
  });
  const final = ended && finalQuery.data?.id === ended.session.id && isTerminal(finalQuery.data.status) ? finalQuery.data : null;

  // Start the hold when the result is read, not when the session disappeared.
  useEffect(() => {
    if (final && ended && ended.resultAt === null) setEnded({ ...ended, resultAt: Date.now() });
  }, [final, ended]);

  const held: KioskDisplay | null =
    ended && phase !== "done"
      ? final
        ? { kind: "result", session: final }
        : { kind: "ending", session: ended.session, failed: finalQuery.isError }
      : null;

  // A running session is actionable, so it takes the main panel; a result it replaced stays visible beside it.
  const display: KioskDisplay = running ? { kind: "running", session: running } : held ?? { kind: "idle" };
  const previous = running ? held : null;

  return {
    display,
    /** The result of the session that ended while another one started */
    previous,
    now,
    /** When the held result leaves the screen (ms epoch), else null */
    holdUntil: held && ended ? endedDeadline(ended) : null,
    sessions,
    isError: sessionsQuery.isError,
    isPending: sessionsQuery.isPending,
  };
}
