import { api } from "./axios";
import { fetchAllPages, toListQuery, toPaged } from "./paging";
import type { AnomalyDto, AnomalyFilters, ListParams, Paged, ResolveAnomalyRequest } from "../@types/types";

// PRD 6.3 / TAMS-95: GET /anomalies?status=, POST /anomalies/{id}/acknowledge, POST /anomalies/{id}/resolve.
// Anomalies are raised by the server (transit timeout, wrong-room tap, unborrowed tap); the web only works them.

const anomaly_end_point = "/anomalies";

export const listAnomaliesApi = async (params: AnomalyFilters & ListParams): Promise<Paged<AnomalyDto>> => {
  const response = await api.get(anomaly_end_point, { params: toListQuery(params) });
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
