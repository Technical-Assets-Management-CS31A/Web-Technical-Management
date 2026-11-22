import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { CircleHelp, MapPinOff, ShieldAlert, Timer, type LucideIcon } from "lucide-react";
import type { AnomalyDto, AnomalyStatus, AnomalyType } from "../../../@types/types";
import { useAcknowledgeAnomaly, useAllAnomalies, useResolveAnomaly } from "../../../hooks/anomalyHooks";
import { useNow } from "../../../hooks/useNow";
import { showToast } from "../../../components/AppToast";
import { getErrorMessage } from "../../../components/form/FormKit";
import { ACTIVE_ANOMALY_STATUSES, ANOMALY_TYPES, countByStatus, countByType, queueRows, type AnomalyTypeFilter, type AnomalyView } from "../../../lib/anomalies";
import { UserData, canHandleAnomalies } from "../../../utils/usersData/userData";
import { ANOMALIES_CONTENT as T } from "../../../constants/anomaliesContent";

export const TYPE_STYLE: Record<AnomalyType, { icon: LucideIcon; tone: string }> = {
  WRONG_ROOM: { icon: MapPinOff, tone: "bg-rose-50 text-rose-600" },
  UNBORROWED_TAP: { icon: CircleHelp, tone: "bg-violet-50 text-violet-600" },
  TRANSIT_TIMEOUT: { icon: Timer, tone: "bg-amber-50 text-amber-600" },
};

export const STATUS_TONE: Record<AnomalyStatus, string> = {
  OPEN: "bg-rose-50 text-rose-700 ring-rose-200",
  ACKNOWLEDGED: "bg-amber-50 text-amber-700 ring-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export const useAnomaliesViewModel = () => {
  const viewer = UserData();
  const canHandle = canHandleAnomalies(viewer.role);
  const navigate = useNavigate();
  const params = useSearch({ strict: false }) as { view?: AnomalyView; type?: AnomalyType };
  const view: AnomalyView = params.view ?? "active";
  const type: AnomalyTypeFilter = params.type ?? "all";
  const now = useNow(30_000);

  // The active queue is always loaded (it drives the stats); resolved ones only when that tab is open.
  const activeQuery = useQuery(useAllAnomalies({ status: ACTIVE_ANOMALY_STATUSES }));
  const resolvedQuery = useQuery({ ...useAllAnomalies({ status: "RESOLVED" }), enabled: view === "resolved" });
  const acknowledge = useAcknowledgeAnomaly();
  const resolve = useResolveAnomaly();

  const [search, setSearch] = useState("");
  const [toResolve, setToResolve] = useState<AnomalyDto | null>(null);

  const active = useMemo(() => activeQuery.data ?? [], [activeQuery.data]);
  const current = view === "active" ? activeQuery : resolvedQuery;
  const rows = useMemo(() => queueRows(current.data ?? [], { view, type, q: search }), [current.data, view, type, search]);

  const statusCounts = countByStatus(active);
  const typeCounts = countByType(active);
  const stats = [
    { label: T.stats.open, value: statusCounts.OPEN, sub: T.stats.openSub(statusCounts.ACKNOWLEDGED), icon: ShieldAlert, tone: "bg-slate-100 text-slate-500" },
    ...ANOMALY_TYPES.map((t) => ({ label: T.types[t].label, value: typeCounts[t], sub: T.types[t].hint, icon: TYPE_STYLE[t].icon, tone: TYPE_STYLE[t].tone })),
  ];

  const setSearchParams = (next: { view?: AnomalyView; type?: AnomalyTypeFilter }) => {
    const merged = { view, type, ...next };
    navigate({
      to: "/home/anomalies",
      search: {
        ...(merged.view !== "active" ? { view: merged.view } : {}),
        ...(merged.type !== "all" ? { type: merged.type } : {}),
      },
      replace: true,
    });
  };

  const onAcknowledge = (anomaly: AnomalyDto) => {
    acknowledge.mutate(anomaly.id, {
      onSuccess: () => showToast.success(T.toast.acknowledged, T.toast.acknowledgedMessage(anomaly.asset.assetCode)),
      onError: (err) => showToast.error(T.toast.failed, getErrorMessage(err, T.toast.failedMessage)),
    });
  };

  const onResolve = (anomaly: AnomalyDto, note: string) => {
    resolve.mutate(
      { id: anomaly.id, data: { resolutionNote: note } },
      {
        onSuccess: () => {
          showToast.success(T.toast.resolved, T.toast.resolvedMessage(anomaly.asset.assetCode));
          setToResolve(null);
        },
      },
    );
  };

  const isAcknowledging = (anomaly: AnomalyDto) => acknowledge.isPending && acknowledge.variables === anomaly.id;

  return {
    viewer,
    canHandle,
    navigate,
    params,
    view,
    type,
    now,
    activeQuery,
    resolvedQuery,
    acknowledge,
    resolve,
    search,
    setSearch,
    toResolve,
    setToResolve,
    active,
    current,
    rows,
    statusCounts,
    typeCounts,
    stats,
    setSearchParams,
    onAcknowledge,
    onResolve,
    isAcknowledging,
  };
};

export type AnomaliesViewModel = ReturnType<typeof useAnomaliesViewModel>;
