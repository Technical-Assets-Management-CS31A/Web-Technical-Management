import { UserData } from "../utils/usersData/userData";
import { ShieldAlert, MoreVertical, Pencil, Archive, Ban, CheckCircle, Crown, ShieldCheck, Shield } from "lucide-react";
import type { FC } from "react";
import { useState, useRef, useEffect } from "react";

const ROLE_STYLES: Record<string, { badge: string; icon: typeof Shield }> = {
    superadmin: { badge: "bg-rose-50 text-rose-700 ring-rose-200", icon: Crown },
    admin: { badge: "bg-amber-50 text-amber-700 ring-amber-200", icon: ShieldCheck },
    staff: { badge: "bg-violet-50 text-violet-700 ring-violet-200", icon: Shield },
    default: { badge: "bg-slate-50 text-slate-700 ring-slate-200", icon: Shield },
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
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    userRole: string;
    status: string;
    isBlocked?: boolean;
    onSetEditUserId: (value: string) => void;
    onSetIsEditUserOpen: (value: boolean) => void;
    onMutate: (value: string) => void;
    onBlockUser?: (value: string) => void;
    onUnblockUser?: (value: string) => void;
};

export default function UserTable({
    id,
    firstName,
    lastName,
    username,
    email,
    userRole,
    status,
    isBlocked = false,
    onSetEditUserId,
    onSetIsEditUserOpen,
    onMutate,
    onBlockUser,
    onUnblockUser,
}: UserTableProps) {
    const data = UserData();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleArchiveUser = () => {
        onMutate(id);
        setIsMenuOpen(false);
    }

    const handleEditUser = (id: string) => {
        onSetEditUserId(id);
        onSetIsEditUserOpen(true);
        setIsMenuOpen(false);
    }

    const handleBlockUser = () => {
        onBlockUser?.(id);
        setIsMenuOpen(false);
    }

    const handleUnblockUser = () => {
        onUnblockUser?.(id);
        setIsMenuOpen(false);
    }

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

    type ActionMenuProps = {
        viewerRole?: string;
        targetRole?: string;
        targetStatus?: string;
        targetIsBlocked?: boolean;
    }

    const ActionMenu: FC<ActionMenuProps> = ({
        viewerRole,
        targetRole,
        targetStatus,
        targetIsBlocked,
    }) => {
        const viewer = viewerRole?.toLowerCase();
        const target = targetRole?.toLowerCase();
        const isOnline = targetStatus?.toLowerCase() === "online";

        const isAdminOrSuper = viewer === "admin" || viewer === "superadmin";
        const isStaff = viewer === "staff";

        // Check permissions
        const canArchive = (isAdminOrSuper || isStaff) && !isOnline;
        
        // Block/Unblock permissions:
        // - Staff can block/unblock Teachers and Students
        // - Admin can block/unblock Staff, Teachers, and Students
        // - SuperAdmin can block/unblock everyone except other SuperAdmins
        const canBlockUnblock = onBlockUser && onUnblockUser && (
            (isStaff && (target === "teacher" || target === "student")) ||
            (isAdminOrSuper && target !== "superadmin")
        );
        
        const canEdit = true; // Everyone can edit (with backend validation)

        // Don't show menu if no permissions
        if (!canArchive && !canBlockUnblock && !canEdit) return null;

        return (
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
                        {/* Edit */}
                        {canEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditUser(id);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                                <Pencil className="h-4 w-4" />
                                <span className="font-medium">Edit User</span>
                            </button>
                        )}

                        {/* Block/Unblock */}
                        {canBlockUnblock && (
                            targetIsBlocked ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUnblockUser();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="font-medium">Unblock User</span>
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleBlockUser();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-700 hover:bg-rose-50 transition-colors"
                                >
                                    <Ban className="h-4 w-4" />
                                    <span className="font-medium">Block User</span>
                                </button>
                            )
                        )}

                        {/* Divider if both block and archive are available */}
                        {canBlockUnblock && canArchive && (
                            <div className="my-1 border-t border-slate-100" />
                        )}

                        {/* Archive */}
                        {canArchive && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchiveUser();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-orange-700 hover:bg-orange-50 transition-colors"
                            >
                                <Archive className="h-4 w-4" />
                                <span className="font-medium">Archive User</span>
                            </button>
                        )}

                        {/* Disabled archive message */}
                        {!canArchive && isOnline && (isAdminOrSuper || isStaff) && (
                            <div className="px-4 py-2.5 text-xs text-slate-400 italic">
                                Cannot archive online user
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
    const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
    const isOnline = status?.toLowerCase() === "online";
    const roleStyle = ROLE_STYLES[userRole?.toLowerCase()] ?? ROLE_STYLES.default;

    return (
        <>
            {/* User */}
            <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                        <span
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(fullName)} ${isBlocked ? "opacity-50 grayscale" : ""}`}
                        >
                            {initials}
                        </span>
                        <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white ${isOnline ? "bg-emerald-500" : "bg-slate-300"}`}
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium text-slate-900">{fullName || "—"}</p>
                        <p className="text-xs text-slate-500">@{username}</p>
                    </div>
                </div>
            </td>

            {/* Email */}
            <td className="px-5 py-3 text-slate-600">{email}</td>

            {/* Role */}
            <td className="px-5 py-3">
                <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${roleStyle.badge}`}>
                    <roleStyle.icon className="h-3 w-3" />
                    {userRole}
                </span>
            </td>

            {/* Status */}
            <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isOnline ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}
                    >
                        <span className="relative flex h-1.5 w-1.5">
                            {isOnline && (
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            )}
                            <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
                        </span>
                        {status || "Unknown"}
                    </span>
                    {isBlocked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                            <ShieldAlert className="h-3 w-3" />
                            Blocked
                        </span>
                    )}
                </div>
            </td>

            {/* Actions */}
            <td className="px-5 py-3 text-right">
                <ActionMenu
                    viewerRole={data.userRole}
                    targetRole={userRole}
                    targetStatus={status}
                    targetIsBlocked={isBlocked}
                />
            </td>
        </>
    );
}
