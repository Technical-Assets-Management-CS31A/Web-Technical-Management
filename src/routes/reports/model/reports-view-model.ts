import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { ReportKey } from "../../../@types/types";
import { useReport, useReportList } from "../../../hooks/reportHooks";
import { DEFAULT_RANGE, REPORT_KEYS, describePeriod, resolvePeriod, toDateInput, type ReportRange } from "../../../lib/reports";
import { UserData } from "../../../utils/usersData/userData";

export type ReportsSearch = { report?: ReportKey; range?: ReportRange; from?: string; to?: string };

export const useReportsViewModel = () => {
  const viewer = UserData();
  const isAdmin = viewer.role === "ADMIN";
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as ReportsSearch;

  const selected: ReportKey = search.report ?? REPORT_KEYS[0];
  const range: ReportRange = search.range ?? DEFAULT_RANGE;
  const today = toDateInput(new Date());
  const customFrom = search.from ?? today;
  const customTo = search.to ?? today;

  const period = useMemo(() => resolvePeriod(range, { from: customFrom, to: customTo }), [range, customFrom, customTo]);
  const periodOk = period ?? {};

  const listQuery = useQuery(useReportList(periodOk, isAdmin && !!period));
  const detailQuery = useQuery(useReport(selected, periodOk, isAdmin && !!period));

  const setSearch = (next: Partial<ReportsSearch>) => {
    const merged = { report: selected, range, from: search.from, to: search.to, ...next };
    navigate({
      to: "/home/reports",
      search: {
        ...(merged.report !== REPORT_KEYS[0] ? { report: merged.report } : {}),
        ...(merged.range !== DEFAULT_RANGE ? { range: merged.range } : {}),
        ...(merged.range === "custom" ? { from: merged.from ?? today, to: merged.to ?? today } : {}),
      },
      replace: true,
    });
  };

  // Shown from the requested period right away, not after the list answers.
  const periodText = period ? describePeriod(period) : null;

  return {
    isAdmin,
    selected,
    range,
    customFrom,
    customTo,
    isPeriodValid: !!period,
    periodText,
    listQuery,
    detailQuery,
    selectReport: (report: ReportKey) => setSearch({ report }),
    setRange: (next: ReportRange) => setSearch({ range: next }),
    setCustom: (field: "from" | "to", value: string) => setSearch({ range: "custom", [field]: value }),
  };
};

export type ReportsViewModel = ReturnType<typeof useReportsViewModel>;
