import { api } from "./axios";
import { unwrap } from "./paging";
import type { ReportDetailDto, ReportKey, ReportListDto } from "../@types/types";

export type ReportPeriod = { from?: string; to?: string };

/** One card per report with its headline. Builds every report, so call it once per period. */
export const listReportsApi = async (period: ReportPeriod): Promise<ReportListDto> => {
  const response = await api.get("/reports", { params: period });
  return unwrap(response.data);
};

/** Full stats and breakdowns for one report. */
export const getReportApi = async (key: ReportKey, period: ReportPeriod): Promise<ReportDetailDto> => {
  const response = await api.get(`/reports/${encodeURIComponent(key)}`, { params: period });
  return unwrap(response.data);
};
