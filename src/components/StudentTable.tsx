import { useEffect, useRef, useState } from "react";
import { Fingerprint, Lock, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { StudentDto } from "../@types/types";
import { UserData, canManageRoster } from "../utils/usersData/userData";
import { fullName } from "../lib/utils";
import StandingPill from "./StandingPill";
import { DeletedBadge, RestoreButton } from "./DeletedRecords";

type StudentTableProps = {
    student: StudentDto;
    onEdit: (id: string) => void;
    onEnroll: (id: string) => void;
    onDelete: (id: string) => void;
    onRestore: (id: string) => void;
    isRestoring?: boolean;
};

export const StudentTable = ({ student, onEdit, onEnroll, onDelete, onRestore, isRestoring = false }: StudentTableProps) => {
    const viewer = UserData();
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

    const canManage = canManageRoster(viewer.role);
    const isDeleted = !!student.deletedAt;
    const run = (action: (id: string) => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        action(student.id);
        setIsMenuOpen(false);
    };

    return (
        <>
            <td className="px-6 py-4">
                <p className={`flex items-center gap-2 font-medium ${isDeleted ? "text-slate-500" : "text-slate-900"}`}>
                    {fullName(student)}
                    {isDeleted && <DeletedBadge />}
                </p>
                <p className="font-mono text-xs text-slate-500">{student.studentNo}</p>
            </td>
            <td className="px-6 py-4 text-slate-600">
                <p className="font-medium">{student.section?.code ?? "—"}</p>
                <p className="text-xs text-slate-400">{student.section?.schoolYear}</p>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-1.5">
                    <StandingPill standing={student.standing} />
                    {student.hasActiveHold && (
                        <span title="Has an OVERDUE or MISSING loan" className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                            <Lock className="h-3 w-3" />
                            Hold
                        </span>
                    )}
                </div>
            </td>
            <td className="px-6 py-4 tabular-nums text-slate-600">
                {student.activeWarningCount} / {student.activeMarkCount}
            </td>
            <td className="px-6 py-4">
                {/* Templates never reach the web; only the enrolled-finger count does. */}
                {student.enrolledFingerCount ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        <Fingerprint className="h-3 w-3" />
                        Enrolled · {student.enrolledFingerCount} finger{student.enrolledFingerCount === 1 ? "" : "s"}
                    </span>
                ) : (
                    <span title="Cannot borrow until a fingerprint is enrolled at the kiosk" className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                        <Fingerprint className="h-3 w-3" />
                        Not enrolled
                    </span>
                )}
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${student.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${student.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {student.status === "ACTIVE" ? "Active" : "Inactive"}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                {canManage && isDeleted && <RestoreButton onRestore={() => onRestore(student.id)} isRestoring={isRestoring} />}
                {canManage && !isDeleted && (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
                            title="More actions"
                        >
                            <MoreVertical className="h-5 w-5" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 z-50 mt-1 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-100">
                                <button onClick={run(onEdit)} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700">
                                    <Pencil className="h-4 w-4" />
                                    <span className="font-medium">Edit student</span>
                                </button>
                                <button onClick={run(onEnroll)} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700">
                                    <Fingerprint className="h-4 w-4" />
                                    <span className="font-medium">Enroll fingerprint</span>
                                </button>
                                <div className="my-1 border-t border-slate-100" />
                                <button onClick={run(onDelete)} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-700 transition-colors hover:bg-rose-50">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="font-medium">Delete student</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </td>
        </>
    );
};
