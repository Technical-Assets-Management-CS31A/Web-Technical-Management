import type { AnomalyDto, AnomalyStatus, AnomalyType } from "../@types/types";

// Pure helpers for the anomalies queue (PRD FR-4.5, US-09). Kept out of the component so they can be unit tested.

export type AnomalyView = "active" | "resolved";
export type AnomalyTypeFilter = "all" | AnomalyType;

/** OPEN and ACKNOWLEDGED stay in the queue; RESOLVED leaves it (US-09 acceptance). */
export const ACTIVE_ANOMALY_STATUSES: AnomalyStatus[] = ["OPEN", "ACKNOWLEDGED"];
export const ANOMALY_TYPES: AnomalyType[] = ["WRONG_ROOM", "UNBORROWED_TAP", "TRANSIT_TIMEOUT"];

export const isAnomalyView = (value: unknown): value is AnomalyView => value === "active" || value === "resolved";
export const isAnomalyTypeFilter = (value: unknown): value is AnomalyTypeFilter =>
  value === "all" || (ANOMALY_TYPES as unknown[]).includes(value);

export const isActiveAnomaly = (anomaly: AnomalyDto) => anomaly.status !== "RESOLVED";

const time = (iso: string | null | undefined) => {
  const t = iso ? Date.parse(iso) : Number.NaN;
  return Number.isFinite(t) ? t : 0;
};

/** detected_at from the PRD table, falling back to createdAt. */
export const detectedAtOf = (anomaly: AnomalyDto) => anomaly.detectedAt ?? anomaly.createdAt;

export const countByType = (anomalies: readonly AnomalyDto[]): Record<AnomalyTypeFilter, number> => {
  const counts: Record<AnomalyTypeFilter, number> = { all: anomalies.length, WRONG_ROOM: 0, UNBORROWED_TAP: 0, TRANSIT_TIMEOUT: 0 };
  for (const anomaly of anomalies) counts[anomaly.type] = (counts[anomaly.type] ?? 0) + 1;
  return counts;
};

export const countByStatus = (anomalies: readonly AnomalyDto[]): Record<AnomalyStatus, number> => {
  const counts: Record<AnomalyStatus, number> = { OPEN: 0, ACKNOWLEDGED: 0, RESOLVED: 0 };
  for (const anomaly of anomalies) counts[anomaly.status] += 1;
  return counts;
};

export const matchesAnomalySearch = (anomaly: AnomalyDto, term: string) => {
  const q = term.trim().toLowerCase();
  if (!q) return true;
  return [
    anomaly.asset?.assetCode,
    anomaly.asset?.name,
    anomaly.loan?.loanNo,
    anomaly.room?.code,
    anomaly.room?.name,
    anomaly.station?.stationCode,
    anomaly.resolutionNote,
    anomaly.acknowledgedBy?.fullName,
    anomaly.resolvedBy?.fullName,
  ].some((value) => value?.toLowerCase().includes(q));
};

/**
 * The rows a view shows, in queue order.
 * Active: OPEN before ACKNOWLEDGED, then oldest first so the longest-waiting anomaly is on top.
 * Resolved: most recently resolved first.
 */
export const queueRows = (
  anomalies: readonly AnomalyDto[],
  { view, type, q }: { view: AnomalyView; type: AnomalyTypeFilter; q: string },
): AnomalyDto[] =>
  anomalies
    .filter((a) => (view === "active" ? isActiveAnomaly(a) : a.status === "RESOLVED"))
    .filter((a) => type === "all" || a.type === type)
    .filter((a) => matchesAnomalySearch(a, q))
    .sort((a, b) =>
      view === "active"
        ? Number(a.status === "ACKNOWLEDGED") - Number(b.status === "ACKNOWLEDGED") || time(detectedAtOf(a)) - time(detectedAtOf(b))
        : time(b.resolvedAt ?? b.createdAt) - time(a.resolvedAt ?? a.createdAt),
    );

/** How long an anomaly has been waiting, e.g. "45s", "12m", "3h 5m", "2d 4h". */
export const formatAge = (iso: string, now: number) => {
  const seconds = Math.max(0, Math.floor((now - time(iso)) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return minutes % 60 ? `${hours}h ${minutes % 60}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  return hours % 24 ? `${days}d ${hours % 24}h` : `${days}d`;
};
