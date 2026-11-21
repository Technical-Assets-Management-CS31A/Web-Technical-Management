import { useRealtimeStatus } from "../hooks/useRealtime";
import type { RealtimeStatus } from "../lib/realtime";

const STYLE: Record<RealtimeStatus, { dot: string; label: string }> = {
  connected: { dot: "bg-emerald-500", label: "Live" },
  connecting: { dot: "bg-slate-400 animate-pulse", label: "Connecting…" },
  reconnecting: { dot: "bg-amber-500 animate-pulse", label: "Reconnecting…" },
  disconnected: { dot: "bg-rose-500", label: "Offline" },
  idle: { dot: "bg-slate-300", label: "Offline" },
};

/** Shows whether the dashboard is receiving SignalR events. */
export default function RealtimeStatusPill() {
  const { status, lastError } = useRealtimeStatus();
  const { dot, label } = STYLE[status];

  return (
    <span
      role="status"
      title={status === "connected" ? "Receiving live updates" : (lastError ?? undefined)}
      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1"
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
