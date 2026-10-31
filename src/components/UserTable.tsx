import { UserData, canManageAccounts } from "../utils/usersData/userData";
import { Snowflake, MoreVertical, Pencil, Trash2, ShieldCheck, Shield, Wrench, Boxes, Presentation, CreditCard, CalendarCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { formatRole, fullName as toFullName, initials as toInitials } from "../lib/utils";
import type { UserDto, UserRole } from "../@types/types";

const ROLE_STYLES: Record<UserRole, { badge: string; icon: typeof Shield }> = {
    ADMIN: { badge: "bg-amber-50 text-amber-700 ring-amber-200", icon: ShieldCheck },
    TECH_STAFF: { badge: "bg-violet-50 text-violet-700 ring-violet-200", icon: Wrench },
    CUSTODIAN: { badge: "bg-cyan-50 text-cyan-700 ring-cyan-200", icon: Boxes },
    INSTRUCTOR: { badge: "bg-blue-50 text-blue-700 ring-blue-200", icon: Presentation },
};

const AVATAR_COLORS = [
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
];

const getAvatarColor = (name: string) => {
    const sum = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

type UserTableProps = {
    user: UserDto;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
};

export default function UserTable({ user, onEdit, onDelete }: UserTableProps) {
    const viewer = UserData();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    // Admins create and edit accounts (FR-9.2); nobody deletes their own.
    const canEdit = canManageAccounts(viewer.role);
    const canDelete = canEdit && viewer.id !== user.id;

    const name = toFullName(user);
    const isActive = user.status === "ACTIVE";
    const roleStyle = ROLE_STYLES[user.role] ?? ROLE_STYLES.TECH_STAFF;
    const activeCards = user.authCards?.filter((card) => card.status === "ACTIVE").length ?? 0;

    return (
        <>
            {/* User */}
            <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                        <span
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(name)} ${isActive ? "" : "opacity-50 grayscale"}`}
                        >
                            {toInitials(user) || "?"}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium text-slate-900">{name || "—"}</p>
                        <p className="font-mono text-xs text-slate-500">{user.employeeNo}</p>
                    </div>
                </div>
            </td>

            {/* Email */}
            <td className="px-5 py-3 text-slate-600">{user.email}</td>

            {/* Role */}
            <td className="px-5 py-3">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${roleStyle.badge}`}>
                        <roleStyle.icon className="h-3 w-3" />
                        {formatRole(user.role)}
                    </span>
                    {user.isEventCoordinator && (
                        <span title="Event coordinator" className="inline-flex items-center rounded-md bg-slate-100 p-1 text-slate-500 ring-1 ring-inset ring-slate-200">
                            <CalendarCheck className="h-3 w-3" />
                        </span>
                    )}
                </div>
            </td>

            {/* Status */}
            <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}
                    >
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {isActive ? "Active" : "Inactive"}
                    </span>
                    {user.isFrozen && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-200">
                            <Snowflake className="h-3 w-3" />
                            Frozen
                        </span>
                    )}
                </div>
            </td>

            {/* Card (instructors only) */}
            <td className="px-5 py-3 text-xs text-slate-500">
                {user.role === "INSTRUCTOR" ? (
                    <span className={`inline-flex items-center gap-1.5 ${activeCards ? "text-slate-700" : "text-amber-700"}`}>
                        <CreditCard className="h-3.5 w-3.5" />
                        {activeCards ? `${activeCards} active` : "No card"}
                    </span>
                ) : "—"}
            </td>

            {/* Actions */}
            <td className="px-5 py-3 text-right">
                {canEdit && (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                            title="More actions"
                        >
                            <MoreVertical className="h-5 w-5" />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(user.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                >
                                    <Pencil className="h-4 w-4" />
                                    <span className="font-medium">Edit account</span>
                                </button>

                                {canDelete && (
                                    <>
                                        <div className="my-1 border-t border-slate-100" />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(user.id);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-700 hover:bg-rose-50 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="font-medium">Delete account</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </td>
        </>
    );
}
