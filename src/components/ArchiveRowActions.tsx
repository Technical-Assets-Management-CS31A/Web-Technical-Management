import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";
import { UserData } from "../utils/usersData/userData";
import { ARCHIVE_CONTENT as T } from "../constants/archiveContent";

type ArchiveRowActionsProps = {
    restoreLabel: string;
    deleteLabel: string;
    onRestore: () => void;
    onDelete: () => void;
    isRestoring?: boolean;
    isDeleting?: boolean;
};

export default function ArchiveRowActions({
    restoreLabel,
    deleteLabel,
    onRestore,
    onDelete,
    isRestoring = false,
    isDeleting = false,
}: ArchiveRowActionsProps) {
    const data = UserData();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

    const role = data.userRole?.toLowerCase();
    const isAdminOrSuper = role === "admin" || role === "superadmin";
    const isStaff = role === "staff";

    if (!isAdminOrSuper && !isStaff) return null;

    return (
        <div className="relative inline-block text-left" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                    isMenuOpen
                        ? "border-slate-300 bg-slate-100 text-slate-700"
                        : "border-transparent text-slate-400 hover:border-slate-200 hover:bg-white hover:text-slate-700"
                }`}
                title={T.rowActions.moreActions}
                aria-label={T.rowActions.moreActions}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>

            {isMenuOpen && (
                <div
                    role="menu"
                    className="absolute right-0 z-50 mt-1.5 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => { onRestore(); setIsMenuOpen(false); }}
                        disabled={isRestoring}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RotateCcw className="h-4 w-4 text-slate-400" />
                        {restoreLabel}
                    </button>

                    {isAdminOrSuper && (
                        <>
                            <div className="my-1 h-px bg-slate-100" />
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => { onDelete(); setIsMenuOpen(false); }}
                                disabled={isDeleting}
                                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4" />
                                {deleteLabel}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
