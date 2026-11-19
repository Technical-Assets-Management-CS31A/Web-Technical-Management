import { jwtDecode } from "jwt-decode";
import type { RealtimeEventMap } from "../@types/types";

// Pure helpers for the SignalR client (src/services/signalrService.ts). No connection state lives here.

export type RealtimeEventName = keyof RealtimeEventMap;

export type RealtimeStatus = "idle" | "connecting" | "connected" | "reconnecting" | "disconnected";

/** One hub event as the store keeps it. `id` is a per-tab sequence number, newest is highest. */
export type RealtimeEnvelope = {
  [K in RealtimeEventName]: { id: number; name: K; payload: RealtimeEventMap[K]; receivedAt: number };
}[RealtimeEventName];

export type RealtimeEnvelopeOf<K extends RealtimeEventName> = Extract<RealtimeEnvelope, { name: K }>;

export const REALTIME_EVENTS = [
  "asset.statusChanged",
  "loan.created",
  "loan.overdue",
  "room.occupancyChanged",
  "anomaly.raised",
  "anomaly.resolved",
  "warning.issued",
  "station.healthChanged",
  "scan.recorded",
] as const satisfies readonly RealtimeEventName[];

export const HUB_PATH = "/notificationHub";

/** The hub sits at the API host root, so a trailing /api/v1 is stripped from the base URL. */
export const buildHubUrl = (apiBaseUrl: string | undefined): string => {
  const root = (apiBaseUrl || "http://localhost:5278").replace(/\/+$/, "").replace(/\/api\/v\d+$/, "");
  return `${root}${HUB_PATH}`;
};

const RECONNECT_STEPS_MS = [0, 2_000, 5_000, 10_000];
const RECONNECT_MAX_MS = 30_000;

/**
 * Delay before reconnect attempt `attempt` (0-based). It never returns null, so the client never gives up.
 * After the fixed steps it waits 30 s, give or take 20 %, so many tabs do not all retry at the same moment.
 */
export const reconnectDelay = (attempt: number, random: () => number = Math.random): number => {
  if (attempt < RECONNECT_STEPS_MS.length) return RECONNECT_STEPS_MS[attempt];
  const jitter = (random() * 2 - 1) * 0.2 * RECONNECT_MAX_MS;
  return Math.round(RECONNECT_MAX_MS + jitter);
};

/** True when the JWT is unreadable, has no exp, or expires within `skewMs`. */
export const isTokenExpiring = (token: string, now: number = Date.now(), skewMs = 30_000): boolean => {
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    return typeof exp !== "number" || exp * 1000 - skewMs <= now;
  } catch {
    return true;
  }
};

export const MAX_RECENT_EVENTS = 100;

/** Newest first, capped at `max`. Returns a new array. */
export const pushRecent = (recent: readonly RealtimeEnvelope[], next: RealtimeEnvelope, max = MAX_RECENT_EVENTS): RealtimeEnvelope[] =>
  [next, ...recent].slice(0, max);

/** React Query key roots each event makes stale. */
export const QUERY_KEYS_BY_EVENT: Record<RealtimeEventName, readonly string[]> = {
  "asset.statusChanged": ["assets", "loans", "dashboard"],
  "loan.created": ["loans", "assets", "dashboard", "kioskSessions"],
  "loan.overdue": ["loans", "dashboard", "students"],
  "room.occupancyChanged": ["dashboard", "loans", "room-occupancy"],
  "anomaly.raised": ["dashboard", "loans", "assets", "anomalies"],
  "anomaly.resolved": ["dashboard", "loans", "assets", "anomalies"],
  "warning.issued": ["students", "standing", "loans"],
  "station.healthChanged": ["dashboard", "stations"],
  "scan.recorded": ["dashboard", "room-occupancy"],
};

/** Every key root any event touches: refreshed after a reconnect, since events sent during the gap are lost. */
export const ALL_REALTIME_QUERY_KEYS: readonly string[] = [...new Set(Object.values(QUERY_KEYS_BY_EVENT).flat())];
