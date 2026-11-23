import { api } from "./axios";
import { fetchAllPages, toListQuery, toPaged } from "./paging";
import type { AnomalyDto, AnomalyFilters, ListParams, Paged, ResolveAnomalyRequest } from "../@types/types";

// PRD 6.3 / TAMS-95: GET /anomalies?status=, POST /anomalies/{id}/acknowledge, POST /anomalies/{id}/resolve.
// Anomalies are raised by the server (transit timeout, wrong-room tap, unborrowed tap); the web only works them.

const anomaly_end_point = "/anomalies";

/**
 * The backend takes a single status, or "active" for everything not RESOLVED. A list of statuses is
 * mapped onto that: OPEN+ACKNOWLEDGED becomes "active", one status is sent as is.
 */
const toStatusParam = (status: AnomalyFilters["status"]): string | undefined => {
  if (!Array.isArray(status)) return status;
  const unique = [...new Set(status)];
  if (unique.length === 0 || unique.length === 3) return undefined;
  if (unique.length === 1) return unique[0];
  if (!unique.includes("RESOLVED")) return "active";
  // OPEN+RESOLVED or ACKNOWLEDGED+RESOLVED has no server form; fetch everything and let the caller filter.
  return undefined;
};

export const listAnomaliesApi = async (params: AnomalyFilters & ListParams): Promise<Paged<AnomalyDto>> => {
  const response = await api.get(anomaly_end_point, {
    params: toListQuery({ ...params, status: toStatusParam(params.status) }),
  });
  return toPaged<AnomalyDto>(response.data, params);
};

/** Every anomaly matching the filters, fetched page by page. */
export const allAnomaliesApi = async (filters: AnomalyFilters = {}): Promise<AnomalyDto[]> =>
  fetchAllPages(listAnomaliesApi, filters);

export const acknowledgeAnomalyApi = async (id: string) => {
  const response = await api.post(`${anomaly_end_point}/${id}/acknowledge`);
  return response.data;
};

export const resolveAnomalyApi = async ({ id, data }: { id: string; data: ResolveAnomalyRequest }) => {
  const response = await api.post(`${anomaly_end_point}/${id}/resolve`, data);
  return response.data;
};
