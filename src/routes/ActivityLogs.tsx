import { useMemo, useState } from "react";
import { useActivityLogs } from "../hooks/logsHooks";
import { useNavigate } from "@tanstack/react-router";
import {
    Search,
    Activity,
    ArrowRight,
    ArrowLeftRight,
    CalendarClock,
    ChevronLeft,
    ChevronRight,
    Info,
    ListChecks,
    Tag,
    Users,
    X,
} from "lucide-react";
import type { TActivityLogs } from "../@types/types";
import ActivityLogsSkeletonLoader from "../loader/ActivityLogsSkeletonLoader";
import { useActivityLogsState } from "../states/activity-logs-state";
import { ACTIVITY_LOGS_CONTENT as T } from "../constants/activityLogsContent";

const ITEMS_PER_PAGE = 10;

type ActionKind = "create" | "update" | "remove" | "borrow" | "return" | "other";
type ActionFilter = "all" | Exclude<ActionKind, "other">;

const getActionKind = (action: string): ActionKind => {
    const act = action.toLowerCase();
    if (act.includes("add") || act.includes("create")) return "create";
    if (act.includes("delete") || act.includes("remove") || act.includes("archive")) return "remove";
    if (act.includes("update") || act.includes("edit")) return "update";
    if (act.includes("return")) return "return";
    if (act.includes("borrow") || act.includes("lent")) return "borrow";
    return "other";
};

const ACTION_STYLES: Record<ActionKind, string> = {
    create: "bg-emerald-500",
    update: "bg-amber-500",
    remove: "bg-rose-500",
    borrow: "bg-blue-500",
    return: "bg-indigo-500",
    other: "bg-slate-400",
};

const FILTERS: ActionFilter[] = ["all", "create", "update", "remove", "borrow", "return"];

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

const timeAgo = (iso: string, now: number) => {
    const minutes = Math.floor((now - new Date(iso).getTime()) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return dateFormatter.format(new Date(iso));
};

function ActionBadge({ action }: { action: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
            <span className={`h-1.5 w-1.5 rounded-full ${ACTION_STYLES[getActionKind(action)]}`} />
            {action}
        </span>
    );
}

export default function ActivityLogs() {
    const { data: logs, isLoading, isError } = useActivityLogs();
    const { searchTerm, setSearchTerm, currentPage, setCurrentPage } = useActivityLogsState();
    const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
    const [now] = useState(() => Date.now());
    const navigate = useNavigate();

    // Newest first
    const allLogs: TActivityLogs[] = useMemo(
        () =>
            [...(logs?.data ?? [])].sort(
                (a: TActivityLogs, b: TActivityLogs) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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
            { label: T.stats.actors, value: new Set(allLogs.map((l) => l.actorUserId || l.actorName)).size, icon: Users },
            {
                label: T.stats.movements,
                value: allLogs.filter((l) => ["borrow", "return"].includes(getActionKind(l.action ?? ""))).length,
                icon: ArrowLeftRight,
            },
        ];
    }, [allLogs, now]);

    const filterCounts = useMemo(() => {
        const counts: Record<ActionFilter, number> = { all: allLogs.length, create: 0, update: 0, remove: 0, borrow: 0, return: 0 };
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
                (log.actorName ?? "").toLowerCase().includes(term) ||
                (log.action ?? "").toLowerCase().includes(term) ||
                (log.itemName ?? "").toLowerCase().includes(term);
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

    if (isLoading) return <ActivityLogsSkeletonLoader />;

    if (isError) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 p-6">
                <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 text-center">
                    <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <Activity className="h-5 w-5 text-slate-400" />
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900">{T.error.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{T.error.description}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                        {T.error.refresh}
                    </button>
                </div>
            </div>
        );
    }

    const pageItems = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce<(number | "…")[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
            acc.push(p);
            return acc;
        }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">

                {/* Header */}
                <header>
                    <p className="text-xs font-medium uppercase tracking-wider text-blue-600">{T.eyebrow}</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">{T.description}</p>
                </header>

                {/* Summary */}
                <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
                            <div className="min-w-0">
                                <p className="truncate text-sm text-slate-500">{stat.label}</p>
                                <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{stat.value}</p>
                            </div>
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                <stat.icon className="h-5 w-5" />
                            </span>
                        </div>
                    ))}
                </section>

                {/* Table card */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                    {/* Toolbar */}
                    <div className="space-y-4 border-b border-slate-200 px-5 py-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">{T.tableTitle}</h2>
                                <p className="mt-0.5 text-xs text-slate-500">{T.countLabel(filteredLogs.length)}</p>
                            </div>
                            <div className="relative w-full lg:w-80">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={T.searchPlaceholder}
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => handleSearch("")}
                                        aria-label="Clear search"
                                        className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Action filters */}
                        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
                            {FILTERS.map((filter) => {
                                const isActive = actionFilter === filter;
                                return (
                                    <button
                                        key={filter}
                                        type="button"
                                        onClick={() => handleFilter(filter)}
                                        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors ${
                                            isActive
                                                ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                                        }`}
                                    >
                                        {filter !== "all" && (
                                            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-white" : ACTION_STYLES[filter]}`} />
                                        )}
                                        {T.actionFilters[filter]}
                                        <span className={`text-xs tabular-nums ${isActive ? "text-blue-100" : "text-slate-400"}`}>
                                            {filterCounts[filter]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full whitespace-nowrap text-left text-sm">
                            <thead>
                                <tr className="bg-slate-50">
                                    {T.tableHeaders.map((header) => (
                                        <th key={header} className="border-b border-slate-200 px-5 py-3 font-medium text-slate-500">{header}</th>
                                    ))}
                                    <th className="w-10 border-b border-slate-200 px-5 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedLogs.length > 0 ? (
                                    paginatedLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            onClick={() => navigate({ to: "/home/activity-logs/$id", params: { id: log.id } })}
                                            className="group cursor-pointer transition-colors hover:bg-slate-50"
                                        >
                                            {/* Actor */}
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                                                        {(log.actorName ?? "?").charAt(0).toUpperCase()}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-slate-900">{log.actorName}</p>
                                                        <p className="text-xs text-slate-500">{log.actorRole}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Action */}
                                            <td className="px-5 py-3">
                                                <ActionBadge action={log.action} />
                                            </td>

                                            {/* Item */}
                                            <td className="px-5 py-3">
                                                <p className="font-medium text-slate-900">{log.itemName || "—"}</p>
                                                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                                                    {log.itemSerialNumber && (
                                                        <span className="inline-flex items-center gap-1 font-mono">
                                                            <Tag className="h-3 w-3 text-slate-400" />
                                                            {log.itemSerialNumber}
                                                        </span>
                                                    )}
                                                    {log.itemSerialNumber && log.category && <span className="text-slate-300">·</span>}
                                                    {log.category && <span>{log.category}</span>}
                                                </div>
                                            </td>

                                            {/* Status change */}
                                            <td className="px-5 py-3">
                                                {log.previousStatus || log.newStatus ? (
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className={log.previousStatus ? "text-slate-500" : "italic text-slate-400"}>
                                                            {log.previousStatus || T.none}
                                                        </span>
                                                        <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                                                        <span className="rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                                                            {log.newStatus || T.none}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">{T.noStatusChange}</span>
                                                )}
                                            </td>

                                            {/* When */}
                                            <td className="px-5 py-3" title={`${dateFormatter.format(new Date(log.createdAt))}, ${timeFormatter.format(new Date(log.createdAt))}`}>
                                                <p className="font-medium text-slate-700">{timeAgo(log.createdAt, now)}</p>
                                                <p className="text-xs text-slate-500">
                                                    {dateFormatter.format(new Date(log.createdAt))} · {timeFormatter.format(new Date(log.createdAt))}
                                                </p>
                                            </td>

                                            <td className="px-5 py-3 text-right">
                                                <ChevronRight className="ml-auto h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500" />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={T.tableHeaders.length + 1} className="px-8 py-20 text-center">
                                            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                                <Search className="h-5 w-5 text-slate-400" />
                                            </span>
                                            <p className="text-sm font-semibold text-slate-900">{T.empty.title}</p>
                                            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{T.empty.description}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer: count + pagination */}
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 text-sm sm:flex-row">
                        <span className="text-slate-500">
                            {T.pagination.showing}{" "}
                            <span className="font-medium text-slate-900 tabular-nums">
                                {filteredLogs.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredLogs.length)}
                            </span>
                            {T.pagination.of}
                            <span className="font-medium text-slate-900 tabular-nums">{filteredLogs.length}</span>
                            {T.pagination.entries}
                        </span>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-slate-600 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    {T.pagination.prev}
                                </button>
                                {pageItems.map((item, idx) =>
                                    item === "…" ? (
                                        <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400">…</span>
                                    ) : (
                                        <button
                                            key={item}
                                            onClick={() => setCurrentPage(item)}
                                            className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium tabular-nums transition-colors ${
                                                page === item ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    ),
                                )}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-slate-600 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40"
                                >
                                    {T.pagination.next}
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <p className="flex items-start gap-2 border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
                        <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span>{T.footerHint}</span>
                    </p>
                </section>
            </div>
        </div>
    );
}
