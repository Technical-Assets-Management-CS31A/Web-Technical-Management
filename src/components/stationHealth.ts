import type { StationHealth } from "../@types/types";

// Health comes from station heartbeats (PRD 6.4 station.healthChanged).
export const HEALTH_DOT: Record<StationHealth, string> = {
  ONLINE: "bg-emerald-500",
  WARNING: "bg-amber-500",
  OFFLINE: "bg-rose-500",
};
