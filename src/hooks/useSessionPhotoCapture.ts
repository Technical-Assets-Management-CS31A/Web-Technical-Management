import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CheckoutSessionDto } from "../@types/types";
import { useActiveKioskSessions, useFailKioskSession, useUploadSessionPhoto } from "./loanHooks";
import {
  CAMERA_ERROR_REASON,
  PHOTO_FAILURE_CODE,
  PHOTO_MAX_ATTEMPTS,
  needsPhoto,
  pickPhotoSession,
  pickWatchedSession,
  runPhotoStep,
} from "../lib/sessionPhoto";
import { getErrorMessage } from "../components/form/FormKit";

// Links the counter webcam to the kiosk session (PRD 4 F1 step 5, 6.2):
// polls the active sessions and, at AWAITING_PHOTO, captures and uploads the photo with one
// automatic retry. If that fails too, the session is failed with "Camera error".

export type PhotoRunPhase = "capturing" | "retrying" | "uploaded" | "denied" | "denyFailed" | "aborted";

export type PhotoRun = {
  sessionId: string;
  phase: PhotoRunPhase;
  attempt: number;
  /** Local preview of the last captured frame */
  photoUrl: string | null;
  /** Why the last attempt failed, for staff */
  error: string | null;
};

type Options = {
  /** Opens the camera if needed, waits for a frame and captures it. */
  captureWhenReady: (fileName?: string) => Promise<File>;
  /** Off while the page is not ready to shoot (e.g. camera unsupported). */
  enabled?: boolean;
};

export function useSessionPhotoCapture({ captureWhenReady, enabled = true }: Options) {
  const sessionsQuery = useQuery(useActiveKioskSessions());
  const upload = useUploadSessionPhoto();
  const fail = useFailKioskSession();

  const sessions = useMemo(() => (Array.isArray(sessionsQuery.data) ? sessionsQuery.data : []), [sessionsQuery.data]);
  const target = pickPhotoSession(sessions);
  const watched = pickWatchedSession(sessions);

  const [run, setRun] = useState<PhotoRun | null>(null);

  // Each session gets one run, however often polling returns it.
  const handled = useRef(new Set<string>());
  const latestSessions = useRef<CheckoutSessionDto[]>(sessions);
  latestSessions.current = sessions;

  // The run lives longer than a render; read the newest callbacks through refs.
  const deps = useRef({ captureWhenReady, upload: upload.mutateAsync, fail: fail.mutateAsync });
  deps.current = { captureWhenReady, upload: upload.mutateAsync, fail: fail.mutateAsync };

  useEffect(() => {
    if (!enabled || !target || handled.current.has(target.id)) return;
    const sessionId = target.id;
    handled.current.add(sessionId);

    const update = (patch: Partial<PhotoRun>) =>
      setRun((prev) => (prev?.sessionId === sessionId ? { ...prev, ...patch } : prev));
    const showPhoto = (file: File) =>
      setRun((prev) => {
        if (prev?.sessionId !== sessionId) return prev;
        if (prev.photoUrl) URL.revokeObjectURL(prev.photoUrl);
        return { ...prev, photoUrl: URL.createObjectURL(file) };
      });

    setRun((prev) => {
      if (prev?.photoUrl) URL.revokeObjectURL(prev.photoUrl);
      return { sessionId, phase: "capturing", attempt: 1, photoUrl: null, error: null };
    });

    void runPhotoStep({
      attempt: async (n) => {
        update({ phase: n === 1 ? "capturing" : "retrying", attempt: n });
        const photo = await deps.current.captureWhenReady(`checkout-${sessionId}-${n}.jpg`);
        showPhoto(photo);
        await deps.current.upload({ sessionId, photo });
      },
      onAttemptFailed: (_n, err) => update({ error: getErrorMessage(err, CAMERA_ERROR_REASON) }),
      isStillNeeded: () => latestSessions.current.some((s) => s.id === sessionId && needsPhoto(s)),
      deny: async () => {
        await deps.current.fail({ sessionId, data: { failureCode: PHOTO_FAILURE_CODE, reason: CAMERA_ERROR_REASON } });
      },
    }).then((outcome) => {
      update({ phase: outcome.kind });
    });
  }, [enabled, target]);

  // Free the last preview when the page closes.
  const runRef = useRef(run);
  runRef.current = run;
  useEffect(() => () => {
    if (runRef.current?.photoUrl) URL.revokeObjectURL(runRef.current.photoUrl);
  }, []);

  const busy = run?.phase === "capturing" || run?.phase === "retrying";

  return {
    sessions,
    /** The session shown on the page: the one at the photo step, else the oldest checkout. */
    session: busy ? sessions.find((s) => s.id === run?.sessionId) ?? watched : watched,
    run,
    busy,
    maxAttempts: PHOTO_MAX_ATTEMPTS,
    isError: sessionsQuery.isError,
    isPending: sessionsQuery.isPending,
  };
}
