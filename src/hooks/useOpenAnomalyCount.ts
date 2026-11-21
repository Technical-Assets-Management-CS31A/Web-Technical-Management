import { useQuery } from "@tanstack/react-query";
import { useAllAnomalies } from "./anomalyHooks";
import { ACTIVE_ANOMALY_STATUSES } from "../lib/anomalies";

// Sidebar badge: anomalies nobody has picked up yet. Shares the queue page's cache entry.
export const useOpenAnomalyCount = () => {
  const { data } = useQuery({ ...useAllAnomalies({ status: ACTIVE_ANOMALY_STATUSES }), retry: false });
  return data?.filter((anomaly) => anomaly.status === "OPEN").length ?? 0;
};
