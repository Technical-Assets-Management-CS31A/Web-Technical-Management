import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CheckoutSessionDto } from "../@types/types";
import { useActiveKioskSessions, useKioskSession } from "./loanHooks";
import { RESULT_HOLD_MS, isTerminal, pickDisplaySession } from "../lib/kioskDisplay";

// Drives the kiosk confirmation view. The active list (polled every 2 s) drops a session as soon as it
// ends, so when the watched session disappears we read it once by id (GET /kiosk/sessions/{id}) and
// hold its result (completed, declined, denied...) on screen for RESULT_HOLD_MS.

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

  const lastRunning = useRef<CheckoutSessionDto | null>(null);
  const [ended, setEnded] = useState<{ session: CheckoutSessionDto; until: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // 1 s tick for the expiry countdown and the result hold.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Changing station starts over.
  useEffect(() => {
    lastRunning.current = null;
    setEnded(null);
  }, [stationCode]);

  useEffect(() => {
    if (running) {
      lastRunning.current = running;
      setEnded(null);
      return;
    }
    // Only react to the poll once data is in, so a failed poll doesn't end a session early.
    if (lastRunning.current && sessionsQuery.isSuccess) {
      setEnded({ session: lastRunning.current, until: Date.now() + RESULT_HOLD_MS });
      lastRunning.current = null;
    }
  }, [running, sessionsQuery.isSuccess]);

  const finalQuery = useQuery({
    ...useKioskSession(ended?.session.id ?? null),
    // The backend may take a moment to settle the final status.
    refetchInterval: (query) => (query.state.data && isTerminal(query.state.data.status) ? false : 2000),
  });

  let display: KioskDisplay = { kind: "idle" };
  if (running) {
    display = { kind: "running", session: running };
  } else if (ended && now < ended.until) {
    const final = finalQuery.data;
    display =
      final && isTerminal(final.status)
        ? { kind: "result", session: final }
        : { kind: "ending", session: ended.session, failed: finalQuery.isError };
  }

  return {
    display,
    now,
    /** When a held result goes back to idle (ms epoch), else null */
    holdUntil: display.kind === "result" || display.kind === "ending" ? ended?.until ?? null : null,
    sessions,
    isError: sessionsQuery.isError,
    isPending: sessionsQuery.isPending,
  };
}
