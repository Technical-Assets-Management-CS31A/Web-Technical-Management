import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { acknowledgeAnomalyApi, allAnomaliesApi, resolveAnomalyApi } from "../api/anomaly_api";
import type { AnomalyFilters } from "../@types/types";

export const ANOMALIES_KEY = ["anomalies"] as const;

/** anomaly.raised / anomaly.resolved invalidate this key (lib/realtime.ts), so the queue stays live. */
export const useAllAnomalies = (filters: AnomalyFilters = {}) => {
  return queryOptions({
    queryFn: () => allAnomaliesApi(filters),
    queryKey: [...ANOMALIES_KEY, filters],
    staleTime: 30 * 1000,
  });
};

const useInvalidateAnomalies = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ANOMALIES_KEY });
    // Resolving can move the asset out of LOCATION_ANOMALY, so the board and lists refresh too.
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["loans"] });
    queryClient.invalidateQueries({ queryKey: ["assets"] });
  };
};

export const useAcknowledgeAnomaly = () => {
  const onSuccess = useInvalidateAnomalies();
  return useMutation({ mutationFn: acknowledgeAnomalyApi, mutationKey: ["anomaly-acknowledge"], onSuccess });
};

export const useResolveAnomaly = () => {
  const onSuccess = useInvalidateAnomalies();
  return useMutation({ mutationFn: resolveAnomalyApi, mutationKey: ["anomaly-resolve"], onSuccess });
};
