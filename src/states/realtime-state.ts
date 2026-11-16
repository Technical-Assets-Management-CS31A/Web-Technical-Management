import { create } from "zustand";
import { pushRecent, type RealtimeEnvelope, type RealtimeEventName, type RealtimeStatus } from "../lib/realtime";
import type { RealtimeEventMap } from "../@types/types";

// Shared real-time state for every dashboard page. Written only by useRealtimeConnection (src/hooks/useRealtime.ts).

interface RealtimeState {
  status: RealtimeStatus;
  lastError: string | null;
  connectedAt: number | null;
  lastEventAt: number | null;
  /** Newest first, capped at MAX_RECENT_EVENTS, across all event types. */
  recent: RealtimeEnvelope[];
  record: <K extends RealtimeEventName>(name: K, payload: RealtimeEventMap[K]) => void;
  setStatus: (status: RealtimeStatus, error?: string) => void;
}

let nextId = 1;

const INITIAL = {
  status: "idle" as RealtimeStatus,
  lastError: null,
  connectedAt: null,
  lastEventAt: null,
  recent: [] as RealtimeEnvelope[],
};

export const useRealtimeStore = create<RealtimeState>((set) => ({
  ...INITIAL,
  record: (name, payload) =>
    set((state) => {
      const receivedAt = Date.now();
      const envelope = { id: nextId++, name, payload, receivedAt } as RealtimeEnvelope;
      return { recent: pushRecent(state.recent, envelope), lastEventAt: receivedAt };
    }),
  setStatus: (status, error) =>
    set((state) => ({
      status,
      lastError: status === "connected" ? null : (error ?? state.lastError),
      connectedAt: status === "connected" ? Date.now() : status === "idle" ? null : state.connectedAt,
    })),
}));

/** Called on logout so the next account starts with an empty feed. */
export const resetRealtimeState = () => useRealtimeStore.setState(INITIAL);
