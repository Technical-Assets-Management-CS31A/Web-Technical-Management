import { useParams, useRouter } from "@tanstack/react-router";
import { useAuditLogById } from "../hooks/logsHooks";
import { changedKeys } from "../components/auditDiff";
import { formatEnum, formatRole } from "../lib/utils";
import { ACTIVITY_LOG_DETAIL_CONTENT as T } from "../constants/activityLogDetailContent";
import {
    Activity,
    ArrowLeft,
    ArrowRight,
    Tag,
    User,
    Package,
    Hash,
    MessageSquare,
    Clock,
    Sparkles,
} from "lucide-react";

const getActionBadge = (action: string) => {
    const act = action?.toLowerCase() ?? "";
    // Audit actions are UPPER_SNAKE verbs, e.g. WARNING_CLEARED
    let colorClass = "bg-slate-100 text-slate-700 border-slate-200";
    let dotClass = "bg-slate-500";

    if (act.includes("add") || act.includes("create")) {
        colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
        dotClass = "bg-emerald-500";
    } else if (act.includes("delete") || act.includes("remove") || act.includes("archive")) {
        colorClass = "bg-rose-50 text-rose-700 border-rose-200/60";
        dotClass = "bg-rose-500";
    } else if (act.includes("update") || act.includes("edit")) {
        colorClass = "bg-amber-50 text-amber-700 border-amber-200/60";
        dotClass = "bg-amber-500";
    } else if (act.includes("clear") || act.includes("lift") || act.includes("settle") || act.includes("resolve")) {
        colorClass = "bg-violet-50 text-violet-700 border-violet-200/60";
        dotClass = "bg-violet-500";
    } else if (act.includes("loan") || act.includes("missing")) {
        colorClass = "bg-blue-50 text-blue-700 border-blue-200/60";
        dotClass = "bg-blue-500";
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${colorClass}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
            {formatEnum(action)}
        </span>
    );
};

const show = (value: unknown) =>
    value === null || value === undefined || value === "" ? "—" : typeof value === "object" ? JSON.stringify(value) : String(value);

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "Asia/Manila",
    }).format(d);
};

const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Manila",
    }).format(d);
};

export default function ActivityLogDetail() {
    const { id } = useParams({ strict: false }) as { id: string };
    const router = useRouter();
    const { data: log, isLoading, isError } = useAuditLogById(id);

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative flex h-16 w-16 items-center justify-center">
                        <div className="absolute inset-0 animate-ping rounded-full bg-indigo-200 opacity-75" />
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg">
                            <Activity className="h-6 w-6 text-white animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center space-y-1">
                        <h3 className="text-lg font-semibold text-slate-900">{T.loading.title}</h3>
                        <p className="text-sm text-slate-500 font-medium">{T.loading.description}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !log) {
        return (
            <div className="flex h-[80vh] items-center justify-center p-6">
                <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 mb-6">
                        <Activity className="h-8 w-8 text-rose-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{T.notFound.title}</h3>
                    <p className="text-slate-500 mb-6 leading-relaxed">
                        {T.notFound.description}
                    </p>
                    <button
                        onClick={() => router.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-colors focus:ring-4 focus:ring-slate-200"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {T.notFound.goBack}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">

            {/* Back button */}
            <button
                onClick={() => router.history.back()}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors group"
            >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                {T.backToLogs}
            </button>

            {/* Header */}
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold mb-4">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{T.badge}</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
                    {T.title}
                </h1>
                <p className="text-slate-500 font-medium text-sm font-mono">
                    {T.idLabel} {log.id}
                </p>
            </div>

            {/* Detail card */}
            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 overflow-hidden">

                {/* Actor section */}
                <div className="px-8 py-6 border-b border-slate-100">
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {T.sections.actor}
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-50 flex items-center justify-center font-bold text-indigo-700 text-xl shadow-sm border border-indigo-100/50">
                            {log.actor?.fullName?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-900">{log.actor?.fullName}</p>
                            <p className="text-sm text-slate-500 font-medium">{formatRole(log.actor?.role)}</p>
                            {log.actor?.id && (
                                <p className="text-xs text-slate-400 font-mono mt-0.5">{T.uidLabel} {log.actor.id}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action + Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-b border-slate-100">
                    <div className="px-8 py-6">
                        <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5" />
                            {T.sections.action}
                        </p>
                        {getActionBadge(log.action)}
                    </div>
                    <div className="px-8 py-6">
                        <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                            <ArrowRight className="h-3.5 w-3.5" />
                            {T.sections.statusTransition}
                        </p>
                        {changedKeys(log).length > 0 ? (
                            <ul className="space-y-1.5 text-sm">
                                {changedKeys(log).map((key) => (
                                    <li key={key} className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-xs text-slate-500">{key}</span>
                                        <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg text-xs">{show(log.before?.[key])}</span>
                                        <ArrowRight className="h-3 w-3 text-slate-400" />
                                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 text-xs">{show(log.after?.[key])}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-slate-400 text-xs italic">{T.noStatusChange}</span>
                        )}
                    </div>
                </div>

                {/* Record */}
                <div className="px-8 py-6 border-b border-slate-100">
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4 flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5" />
                        {T.sections.record}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
                                <Tag className="h-3 w-3" /> {T.record.type}
                            </p>
                            <p className="font-semibold text-slate-900">{formatEnum(log.entityType) || "—"}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
                                <Hash className="h-3 w-3" /> {T.record.id}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-mono font-medium">
                                {log.entityId || "—"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Timestamp */}
                <div className="px-8 py-6 border-b border-slate-100">
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {T.timestamps.createdAt}
                    </p>
                    <p className="font-semibold text-slate-800 text-sm">{formatDate(log.createdAt)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatTime(log.createdAt)}</p>
                </div>

                {/* Reason given for clear, lift, settle and similar actions */}
                <div className="px-8 py-6">
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {T.sections.reason}
                    </p>
                    {typeof log.after?.reason === "string" && log.after.reason ? (
                        <p className="text-sm text-slate-700 leading-relaxed">{log.after.reason}</p>
                    ) : (
                        <span className="text-slate-300 text-xs italic">{T.noReason}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
