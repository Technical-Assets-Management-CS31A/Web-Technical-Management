import { useMemo, useState } from "react";
import { useBorrowLogs } from "../hooks/logsHooks";
import {
    Search,
    BookOpen,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    History,
    Info,
    PackageOpen,
    PackageCheck,
    Users,
    X,
} from "lucide-react";
import type { TBorrowingLogs } from "../@types/types";
import BorrowLogsSkeletonLoader from "../loader/BorrowLogsSkeletonLoader";
import BorrowLogsDetailModal from "../components/BorrowLogsDetailModal";
import { useBorrowLogsState } from "../states/borrow-logs-state";
import { truncateRemarks } from "../components/truncateRemarks";
import { BORROW_LOGS_CONTENT as T } from "../constants/borrowLogsContent";

const ITEMS_PER_PAGE = 10;

const STATUS_DOT: Record<string, string> = {
    borrowed: "bg-blue-500",
    lent: "bg-blue-500",
    returned: "bg-emerald-500",
    reserved: "bg-amber-500",
    approved: "bg-emerald-500",
    pending: "bg-yellow-500",
    overdue: "bg-rose-500",
    denied: "bg-rose-500",
    canceled: "bg-slate-400",
    available: "bg-teal-500",
};

const statusDot = (status?: string | null) => STATUS_DOT[status?.toLowerCase() ?? ""] ?? "bg-slate-400";

function StatusBadge({ status }: { status: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
            <span className={`h-1.5 w-1.5 rounded-full ${statusDot(status)}`} />
            {status || "—"}
        </span>
    );
}

const parseDate = (value?: string | null) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

const formatDuration = (ms: number) => {
    const minutes = Math.max(0, Math.floor(ms / 60000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${minutes % 60}m`;
    return `${Math.floor(hours / 24)}d ${hours % 24}h`;
};

const getInitials = (name: string | null) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

function DateCell({ value }: { value?: string | null }) {
    const d = parseDate(value);
    if (!d) return <span className="text-slate-400">—</span>;
    return (
        <>
            <p className="font-medium text-slate-700">{dateFormatter.format(d)}</p>
            <p className="text-xs text-slate-500">{timeFormatter.format(d)}</p>
        </>
    );
}

export default function BorrowLogs() {
    const { data: logsData, isLoading, isError } = useBorrowLogs();
    const {
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        currentPage,
        setCurrentPage,
        isDetailModalOpen,
        setIsDetailModalOpen,
        selectedLog,
        setSelectedLog,
    } = useBorrowLogsState();
    const [now] = useState(() => Date.now());

    // Newest first
    const logs: TBorrowingLogs[] = useMemo(() => {
        const raw: TBorrowingLogs[] = logsData?.data ?? logsData ?? [];
        const time = (l: TBorrowingLogs) => (parseDate(l.borrowedAt) ?? parseDate(l.createdAt))?.getTime() ?? 0;
        return [...raw].sort((a, b) => time(b) - time(a));
    }, [logsData]);

    const stats = useMemo(
        () => [
            { label: T.stats.total, value: logs.length, icon: History },
            { label: T.stats.out, value: logs.filter((l) => l.borrowedAt && !l.returnedAt).length, icon: PackageOpen },
            { label: T.stats.returned, value: logs.filter((l) => !!l.returnedAt).length, icon: PackageCheck },
            {
                label: T.stats.borrowers,
                value: new Set(logs.map((l) => l.borrowerUserId || l.borrowerName).filter(Boolean)).size,
                icon: Users,
            },
        ],
        [logs],
    );

    const statusOptions = useMemo(() => {
        const counts = new Map<string, number>();
        for (const l of logs) if (l.currentStatus) counts.set(l.currentStatus, (counts.get(l.currentStatus) ?? 0) + 1);
        return [{ value: "All", count: logs.length }, ...[...counts].map(([value, count]) => ({ value, count }))];
    }, [logs]);

    const filtered = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return logs.filter((log) => {
            const matchesSearch =
                !term ||
                log.borrowerName?.toLowerCase().includes(term) ||
                log.itemName?.toLowerCase().includes(term) ||
                log.itemSerialNumber?.toLowerCase().includes(term) ||
                log.studentIdNumber?.toLowerCase().includes(term) ||
                log.borrowerRole?.toLowerCase().includes(term);
            const matchesStatus = statusFilter === "All" || log.currentStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [logs, searchTerm, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

    const handleSearch = (val: string) => {
        setSearchTerm(val);
        setCurrentPage(1);
    };

    const handleStatusFilter = (s: string) => {
        setStatusFilter(s);
        setCurrentPage(1);
    };

    const handleRowClick = (log: TBorrowingLogs) => {
        setSelectedLog(log);
        setIsDetailModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsDetailModalOpen(false);
        setSelectedLog(null);
    };

    if (isLoading) return <BorrowLogsSkeletonLoader />;

    if (isError) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 p-6">
                <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 text-center">
                    <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <BookOpen className="h-5 w-5 text-slate-400" />
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

    const headers = Object.values(T.tableHeaders);
    const pageItems = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
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
                                <p className="mt-0.5 text-xs text-slate-500">{T.countLabel(filtered.length)}</p>
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

                        {/* Status filters */}
                        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
                            {statusOptions.map(({ value, count }) => {
                                const isActive = statusFilter === value;
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => handleStatusFilter(value)}
                                        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors ${
                                            isActive
                                                ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                                        }`}
                                    >
                                        {value !== "All" && (
                                            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-white" : statusDot(value)}`} />
                                        )}
                                        {value === "All" ? T.allStatuses : value}
                                        <span className={`text-xs tabular-nums ${isActive ? "text-blue-100" : "text-slate-400"}`}>{count}</span>
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
                                    {headers.map((label) => (
                                        <th key={label} className="border-b border-slate-200 px-5 py-3 font-medium text-slate-500">{label}</th>
                                    ))}
                                    <th className="w-10 border-b border-slate-200 px-5 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginated.length > 0 ? (
                                    paginated.map((log) => {
                                        const borrowed = parseDate(log.borrowedAt);
                                        const returned = parseDate(log.returnedAt);
                                        const duration = borrowed ? (returned ?? new Date(now)).getTime() - borrowed.getTime() : null;

                                        return (
                                            <tr key={log.id} onClick={() => handleRowClick(log)} className="group cursor-pointer transition-colors hover:bg-slate-50">
                                                {/* Borrower */}
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                                                            {getInitials(log.borrowerName)}
                                                        </span>
                                                        <div className="min-w-0">
                                                            <p className="max-w-[160px] truncate font-medium text-slate-900">{log.borrowerName ?? "—"}</p>
                                                            <p className="text-xs text-slate-500">
                                                                {log.borrowerRole?.toLowerCase() === "student" ? T.roles.student : log.borrowerRole || "—"}
                                                                {log.studentIdNumber && <span className="font-mono"> · #{log.studentIdNumber}</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Item */}
                                                <td className="px-5 py-3">
                                                    <p className="max-w-[180px] truncate font-medium text-slate-900">{log.itemName || "—"}</p>
                                                    <p className="max-w-[180px] truncate text-xs text-slate-500">
                                                        <span className="font-mono">{log.itemSerialNumber}</span>
                                                        {log.reservedFor && <span> · {T.reservedFor} {log.reservedFor}</span>}
                                                    </p>
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        {log.previousStatus && (
                                                            <>
                                                                <span className="text-xs text-slate-500">{log.previousStatus}</span>
                                                                <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                                                            </>
                                                        )}
                                                        <StatusBadge status={log.currentStatus} />
                                                    </div>
                                                </td>

                                                {/* Borrowed */}
                                                <td className="px-5 py-3">
                                                    <DateCell value={log.borrowedAt} />
                                                </td>

                                                {/* Returned */}
                                                <td className="px-5 py-3">
                                                    {returned ? (
                                                        <DateCell value={log.returnedAt} />
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                            {T.notReturned}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Duration */}
                                                <td className="px-5 py-3 tabular-nums">
                                                    {duration !== null ? (
                                                        <span className={returned ? "text-slate-600" : "font-medium text-slate-900"}>
                                                            {formatDuration(duration)}
                                                            {!returned && <span className="ml-1 text-xs font-normal text-slate-400">so far</span>}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">—</span>
                                                    )}
                                                </td>

                                                {/* Remarks */}
                                                <td className="max-w-[200px] px-5 py-3">
                                                    {log.remarks ? (
                                                        <p className="truncate text-slate-500" title={log.remarks}>{truncateRemarks(log.remarks)}</p>
                                                    ) : (
                                                        <span className="text-slate-400">{T.noRemarks}</span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-3 text-right">
                                                    <ChevronRight className="ml-auto h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500" />
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={headers.length + 1} className="px-8 py-20 text-center">
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
                                {filtered.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)}
                            </span>{" "}
                            {T.pagination.of} <span className="font-medium text-slate-900 tabular-nums">{filtered.length}</span> {T.pagination.entries}
                        </span>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                                    disabled={safePage === 1}
                                    className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-slate-600 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    {T.pagination.prev}
                                </button>
                                {pageItems.map((p, idx) =>
                                    p === "…" ? (
                                        <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium tabular-nums transition-colors ${
                                                safePage === p ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ),
                                )}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                                    disabled={safePage === totalPages}
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

            {/* Detail Modal */}
            {selectedLog && (
                <BorrowLogsDetailModal log={selectedLog} isOpen={isDetailModalOpen} onClose={handleCloseModal} />
            )}
        </div>
    );
}
