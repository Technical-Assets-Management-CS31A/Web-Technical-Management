import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Ban, CheckCircle2, Hand, Loader2, MonitorSmartphone, ShieldX, XCircle } from "lucide-react";
import { useKioskDisplay } from "../../../hooks/useKioskDisplay";
import { useAllStations } from "../../../hooks/roomHooks";
import { IDLE_LCD, toLcdLines, type DisplayTone } from "../../../lib/kioskDisplay";

export const TONE: Record<DisplayTone | "idle", { panel: string; icon: React.ElementType; iconClass: string }> = {
  idle: { panel: "border-slate-200 bg-white", icon: MonitorSmartphone, iconClass: "bg-slate-100 text-slate-500" },
  progress: { panel: "border-blue-200 bg-blue-50/60", icon: Loader2, iconClass: "bg-blue-100 text-blue-700" },
  action: { panel: "border-amber-200 bg-amber-50/70", icon: Hand, iconClass: "bg-amber-100 text-amber-700" },
  success: { panel: "border-emerald-200 bg-emerald-50/70", icon: CheckCircle2, iconClass: "bg-emerald-100 text-emerald-700" },
  declined: { panel: "border-rose-200 bg-rose-50/70", icon: XCircle, iconClass: "bg-rose-100 text-rose-700" },
  denied: { panel: "border-rose-300 bg-rose-50", icon: ShieldX, iconClass: "bg-rose-100 text-rose-700" },
  neutral: { panel: "border-slate-200 bg-slate-50", icon: Ban, iconClass: "bg-slate-200 text-slate-600" },
};

export const useKioskDisplayViewModel = () => {
  const navigate = useNavigate();
  const { station } = useSearch({ strict: false }) as { station?: string };
  const { display, previous, now, holdUntil, isError } = useKioskDisplay(station);
  const { data: stationsData } = useQuery(useAllStations());

  const counterStations = useMemo(
    () =>
      (Array.isArray(stationsData) ? stationsData : [])
        .filter((s) => s.type === "COUNTER_KIOSK" && !s.deletedAt)
        .sort((a, b) => a.stationCode.localeCompare(b.stationCode)),
    [stationsData],
  );

  const session = display.kind === "idle" ? null : display.session;
  const lcd = toLcdLines(session ? session.lcdLines : IDLE_LCD);

  return {
    navigate,
    station,
    display,
    previous,
    now,
    holdUntil,
    isError,
    stationsData,
    counterStations,
    session,
    lcd,
  };
};

export type KioskDisplayViewModel = ReturnType<typeof useKioskDisplayViewModel>;
