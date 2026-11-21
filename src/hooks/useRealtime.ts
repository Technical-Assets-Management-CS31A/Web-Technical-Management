import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { signalRService } from "../services/signalrService";
import { useRealtimeStore } from "../states/realtime-state";
import {
  ALL_REALTIME_QUERY_KEYS,
  QUERY_KEYS_BY_EVENT,
  type RealtimeEnvelopeOf,
  type RealtimeEventName,
} from "../lib/realtime";
import type { RealtimeEventMap } from "../@types/types";

/**
 * Owns the hub connection. Mount it once, in the staff layout (AdminNotificationListener does this).
 * It mirrors status and events into useRealtimeStore and marks the related React Query keys stale,
 * so pages that read data with useQuery update without doing anything themselves.
 * Unmounting does not close the connection; logout does (useLogout).
 */
export const useRealtimeConnection = (enabled = true) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const { record, setStatus } = useRealtimeStore.getState();
    const refresh = (keys: readonly string[]) =>
      keys.forEach((key) => void queryClient.invalidateQueries({ queryKey: [key] }));

    const offEvent = signalRService.onEvent((name, payload) => {
      record(name, payload);
      refresh(QUERY_KEYS_BY_EVENT[name]);
    });
    const offStatus = signalRService.onStatus((status, { error, resumed }) => {
      setStatus(status, error);
      // Events sent while we were offline are not replayed, so refetch everything they could have changed.
      if (status === "connected" && resumed) refresh(ALL_REALTIME_QUERY_KEYS);
    });

    setStatus(signalRService.getStatus());
    void signalRService.start();

    return () => {
      offEvent();
      offStatus();
    };
  }, [enabled, queryClient]);
};

/** Connection state for live indicators. */
export const useRealtimeStatus = () => {
  const status = useRealtimeStore((s) => s.status);
  const lastError = useRealtimeStore((s) => s.lastError);
  const lastEventAt = useRealtimeStore((s) => s.lastEventAt);
  return { status, isLive: status === "connected", lastError, lastEventAt };
};

/**
 * Recent events of one or more types, newest first (only what arrived since this tab connected).
 * Example: const scans = useRealtimeEvents("scan.recorded", 10);
 */
export function useRealtimeEvents<K extends RealtimeEventName>(names: K | readonly K[], limit?: number): RealtimeEnvelopeOf<K>[] {
  const recent = useRealtimeStore((s) => s.recent);
  const key = typeof names === "string" ? names : names.join("|");
  return useMemo(() => {
    const wanted = new Set<string>(key.split("|"));
    const matches = recent.filter((e) => wanted.has(e.name)) as RealtimeEnvelopeOf<K>[];
    return limit ? matches.slice(0, limit) : matches;
  }, [recent, key, limit]);
}

/** The newest event of a type, or null. */
export const useLatestRealtimeEvent = <K extends RealtimeEventName>(name: K): RealtimeEnvelopeOf<K> | null =>
  useRealtimeEvents(name, 1)[0] ?? null;

/**
 * Runs `handler` for each event of the given type(s) while the component is mounted. Use it for side effects
 * (toasts, sounds, local state). The handler can change between renders without resubscribing.
 */
export function useRealtimeEvent<K extends RealtimeEventName>(
  names: K | readonly K[],
  handler: (payload: RealtimeEventMap[K], name: K) => void,
) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  const key = typeof names === "string" ? names : names.join("|");
  useEffect(() => {
    const wanted = new Set<string>(key.split("|"));
    return signalRService.onEvent((name, payload) => {
      if (wanted.has(name)) handlerRef.current(payload as unknown as RealtimeEventMap[K], name as unknown as K);
    });
  }, [key]);
}
