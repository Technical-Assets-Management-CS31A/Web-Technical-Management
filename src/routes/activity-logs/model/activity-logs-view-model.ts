import { useMemo, useState } from "react";
import { useAuditLog } from "../../../hooks/logsHooks";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftRight, CalendarClock, ListChecks, Users } from "lucide-react";
import type { AuditLogEntryDto } from "../../../@types/types";
import { useActivityLogsState } from "../../../states/activity-logs-state";
import { ACTIVITY_LOGS_CONTENT as T } from "../../../constants/activityLogsContent";

export const ITEMS_PER_PAGE = 10;

export type ActionKind = "create" | "update" | "remove" | "resolve" | "loan" | "other";
export type ActionFilter = "all" | Exclude<ActionKind, "other">;

// Audit actions are UPPER_SNAKE verbs such as USER_CREATED, WARNING_CLEARED or LOAN_MARKED_MISSING.
export const getActionKind = (action: string): ActionKind => {
    const act = action.toUpperCase();
    if (act.includes("CLEAR") || act.includes("LIFT") || act.includes("SETTLE") || act.includes("RESOLVE") || act.includes("RESET")) return "resolve";
    if (act.includes("LOAN") || act.includes("MISSING")) return "loan";
    if (act.includes("CREATE") || act.includes("ADD") || act.includes("IMPORT")) return "create";
    if (act.includes("DELETE") || act.includes("REMOVE") || act.includes("RETIRE")) return "remove";
    if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("RESTORE")) return "update";
    return "other";
};

export const ACTION_STYLES: Record<ActionKind, string> = {
    create: "bg-emerald-500",
    update: "bg-amber-500",
    remove: "bg-rose-500",
    resolve: "bg-violet-500",
    loan: "bg-blue-500",
    other: "bg-slate-400",
};

export const FILTERS: ActionFilter[] = ["all", "create", "update", "remove", "resolve", "loan"];

export const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
export const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

export const timeAgo = (iso: string, now: number) => {
    const minutes = Math.floor((now - new Date(iso).getTime()) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return dateFormatter.format(new Date(iso));
};

export const useActivityLogsViewModel = () => {
  const { data: logs, isLoading, isError } = useAuditLog();
  const { searchTerm, setSearchTerm, currentPage, setCurrentPage } = useActivityLogsState();
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [now] = useState(() => Date.now());
  const navigate = useNavigate();

  // Newest first
  const allLogs: AuditLogEntryDto[] = useMemo(
      () =>
          [...(logs ?? [])].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
      [logs],
  );

  const stats = useMemo(() => {
      const startOfToday = new Date(now).setHours(0, 0, 0, 0);
      return [
          { label: T.stats.total, value: allLogs.length, icon: ListChecks },
          {
              label: T.stats.today,
              value: allLogs.filter((l) => new Date(l.createdAt).getTime() >= startOfToday).length,
              icon: CalendarClock,
          },
          { label: T.stats.actors, value: new Set(allLogs.map((l) => l.actor?.id)).size, icon: Users },
          {
              label: T.stats.resolutions,
              value: allLogs.filter((l) => getActionKind(l.action ?? "") === "resolve").length,
              icon: ArrowLeftRight,
          },
      ];
  }, [allLogs, now]);

  const filterCounts = useMemo(() => {
      const counts: Record<ActionFilter, number> = { all: allLogs.length, create: 0, update: 0, remove: 0, resolve: 0, loan: 0 };
      for (const log of allLogs) {
          const kind = getActionKind(log.action ?? "");
          if (kind !== "other") counts[kind]++;
      }
      return counts;
  }, [allLogs]);

  const filteredLogs = useMemo(() => {
      const term = searchTerm.toLowerCase();
      return allLogs.filter((log) => {
          const matchesFilter = actionFilter === "all" || getActionKind(log.action ?? "") === actionFilter;
          const matchesSearch =
              (log.actor?.fullName ?? "").toLowerCase().includes(term) ||
              (log.action ?? "").toLowerCase().includes(term) ||
              (log.entityType ?? "").toLowerCase().includes(term) ||
              (log.entityId ?? "").toLowerCase().includes(term);
          return matchesFilter && matchesSearch;
      });
  }, [allLogs, searchTerm, actionFilter]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const page = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  const paginatedLogs = filteredLogs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (value: string) => {
      setSearchTerm(value);
      setCurrentPage(1);
  };

  const handleFilter = (filter: ActionFilter) => {
      setActionFilter(filter);
      setCurrentPage(1);
  };

  return {
    logs,
    isLoading,
    isError,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    actionFilter,
    setActionFilter,
    now,
    navigate,
    allLogs,
    stats,
    filterCounts,
    filteredLogs,
    totalPages,
    page,
    paginatedLogs,
    handleSearch,
    handleFilter,
  };
};

export type ActivityLogsViewModel = ReturnType<typeof useActivityLogsViewModel>;
