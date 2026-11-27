import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { getReportApi, listReportsApi, type ReportPeriod } from "../api/reports_api";
import type { ReportKey } from "../@types/types";

export const REPORTS_KEY = ["reports"] as const;

export const useReportList = (period: ReportPeriod, enabled = true) =>
  queryOptions({
    queryKey: [...REPORTS_KEY, "list", period],
    queryFn: () => listReportsApi(period),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

export const useReport = (key: ReportKey, period: ReportPeriod, enabled = true) =>
  queryOptions({
    queryKey: [...REPORTS_KEY, key, period],
    queryFn: () => getReportApi(key, period),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
