import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Activity, BadgeAlert, CalendarDays, ClipboardCheck, Gavel, MonitorSmartphone, Radio, type LucideIcon } from "lucide-react";
import type { ReportKey } from "../../../@types/types";
import { useReport, useReportList } from "../../../hooks/reportHooks";
import { DEFAULT_RANGE, REPORT_KEYS, resolvePeriod, toDateInput, type ReportRange } from "../../../lib/reports";
import { UserData } from "../../../utils/usersData/userData";

export const REPORT_ICONS: Record<ReportKey, LucideIcon> = {
  loans: ClipboardCheck,
  anomalies: BadgeAlert,
  violations: Gavel,
  kiosk: MonitorSmartphone,
  stations: Radio,
  audits: Activity,
  events: CalendarDays,
};

export type ReportsSearch = { report?: ReportKey; range?: ReportRange; from?: string; to?: string };

const dateLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

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

  const periodText = listQuery.data
    ? `${dateLabel.format(new Date(listQuery.data.from))} – ${dateLabel.format(new Date(listQuery.data.to))}`
    : "";

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
