import type { StationHealth } from "../@types/types";
import { formatEnum } from "../lib/utils";
import { HEALTH_DOT } from "./stationHealth";

const HEALTH_PILL: Record<StationHealth, string> = {
  ONLINE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  WARNING: "bg-amber-50 text-amber-700 ring-amber-200",
  OFFLINE: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function StationHealthPill({ health }: { health: StationHealth }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${HEALTH_PILL[health] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${HEALTH_DOT[health] ?? "bg-slate-300"}`} />
      {formatEnum(health)}
    </span>
  );
}
