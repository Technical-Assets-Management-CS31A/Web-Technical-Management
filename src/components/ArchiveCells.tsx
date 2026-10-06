// Shared cell pieces for the archive tables.

export function UserIdentity({ firstName, middleName, lastName, subtitle }: {
    firstName: string;
    middleName?: string;
    lastName: string;
    subtitle?: string;
}) {
    const middleInitial = middleName ? `${String(middleName).charAt(0).toUpperCase()}. ` : "";
    const initials = `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase();

    return (
        <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                {initials || "?"}
            </span>
            <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">
                    {firstName} {middleInitial}{lastName}
                </p>
                {subtitle && <p className="truncate font-mono text-xs text-slate-500">{subtitle}</p>}
            </div>
        </div>
    );
}

export function RoleBadge({ role }: { role: string }) {
    const r = role?.toLowerCase();
    const cls =
        r === "admin" || r === "superadmin" ? "bg-rose-50 text-rose-700 ring-rose-600/10"
            : r === "staff" ? "bg-violet-50 text-violet-700 ring-violet-600/10"
                : r === "teacher" ? "bg-blue-50 text-blue-700 ring-blue-600/10"
                    : "bg-emerald-50 text-emerald-700 ring-emerald-600/10";
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${cls}`}>
            {role}
        </span>
    );
}

export function StatusBadge({ status }: { status: string }) {
    const s = status?.toLowerCase();
    const isActive = s === "active" || s === "online";
    return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium capitalize text-slate-600">
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
            {status}
        </span>
    );
}
