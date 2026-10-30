// Shared cell pieces for the deleted-records tables.

import { formatEnum, formatRole } from "../lib/utils";

export function UserIdentity({ firstName, lastName, subtitle }: {
    firstName: string;
    lastName: string;
    subtitle?: string;
}) {
    const initials = `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase();

    return (
        <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                {initials || "?"}
            </span>
            <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">
                    {firstName} {lastName}
                </p>
                {subtitle && <p className="truncate font-mono text-xs text-slate-500">{subtitle}</p>}
            </div>
        </div>
    );
}

export function RoleBadge({ role }: { role: string }) {
    const cls =
        role === "ADMIN" ? "bg-amber-50 text-amber-700 ring-amber-600/10"
            : role === "TECH_STAFF" ? "bg-violet-50 text-violet-700 ring-violet-600/10"
                : role === "CUSTODIAN" ? "bg-cyan-50 text-cyan-700 ring-cyan-600/10"
                    : "bg-blue-50 text-blue-700 ring-blue-600/10";
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
            {formatRole(role)}
        </span>
    );
}

export function StatusBadge({ status }: { status: string }) {
    const isActive = status === "ACTIVE";
    return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
            {formatEnum(status)}
        </span>
    );
}
