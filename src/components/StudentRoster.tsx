import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileSpreadsheet, GraduationCap, Loader2, Plus, RotateCcw, Search } from "lucide-react";
import { EditStudent } from "./EditStudent";
import SearchBar from "./SearchBar";
import { StudentTable } from "./StudentTable";
import ViewStudentCredentials from "./ViewStudentCredentials";
import EnrollFingerprintModal from "./EnrollFingerprintModal";
import ImportRosterDialog from "./ImportRosterDialog";
import PopUpModal from "./PopUpModal";
import Pagination from "./Pagination";
import { ShowDeletedToggle } from "./DeletedRecords";
import { showToast } from "./AppToast";
import { useAllSections, useDeleteStudent, useRestoreStudent, useStudentPage } from "../hooks/userHooks";
import { useAllUsersManagementState, type RosterFilters } from "../states/user-management-state";
import { UserData, canManageRoster } from "../utils/usersData/userData";
import { fullName } from "../lib/utils";
import { getErrorMessage } from "./form/FormKit";
import type { StudentListParams } from "../@types/types";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const STANDING_FILTERS: { value: RosterFilters["standing"]; label: string }[] = [
    { value: "", label: "All" },
    { value: "GOOD", label: "Good" },
    { value: "WARNED", label: "Warned" },
    { value: "BLOCKED", label: "Blocked" },
];

const ENROLLMENT_FILTERS: { value: RosterFilters["enrolled"]; label: string }[] = [
    { value: "", label: "Any fingerprint" },
    { value: "no", label: "Not enrolled" },
    { value: "yes", label: "Enrolled" },
];

const HEADERS = ["Student", "Section", "Standing", "Warnings / Marks", "Fingerprint", "Status"];

const segmentClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-xs font-medium transition-all ${active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`;

// Students are roster records with no login (PRD). Staff add them here or import a roster CSV.
export default function StudentRoster() {
    const viewer = UserData();
    const canManage = canManageRoster(viewer.role);
    const { rosterPage, setRosterPage, rosterFilters: filters, setRosterFilter, clearRosterFilters } = useAllUsersManagementState();
    const { data: sections = [] } = useQuery(useAllSections());

    // ── Search (debounced, then sent as q) ────────────────────────────────
    const [searchInput, setSearchInput] = useState(filters.search);
    useEffect(() => {
        const next = searchInput.trim();
        if (next === filters.search) return;
        const timer = setTimeout(() => setRosterFilter("search", next), SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchInput, filters.search, setRosterFilter]);

    const showDeleted = canManage && filters.showDeleted;
    const params: StudentListParams = {
        page: rosterPage,
        pageSize: PAGE_SIZE,
        sort: "lastName",
        q: filters.search || undefined,
        sectionId: filters.sectionId || undefined,
        standing: filters.standing || undefined,
        enrolled: filters.enrolled === "" ? undefined : filters.enrolled === "yes",
        includeDeleted: showDeleted || undefined,
    };
    const query = useQuery(useStudentPage(params));
    const page = query.data;
    const students = page?.items ?? [];
    const total = page?.total ?? 0;
    const totalPages = page?.totalPages ?? 1;

    useEffect(() => {
        if (page && rosterPage > page.totalPages) setRosterPage(page.totalPages);
    }, [page, rosterPage, setRosterPage]);

    const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent();
    const restore = useRestoreStudent();

    const [viewId, setViewId] = useState("");
    const [editId, setEditId] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [enrollId, setEnrollId] = useState("");
    const [deleteId, setDeleteId] = useState("");

    const find = (id: string) => students.find((s) => s.id === id);
    const viewStudent = find(viewId);
    const editStudent = find(editId);
    const enrollStudent = find(enrollId);

    const confirmDelete = () => {
        deleteStudent(deleteId, {
            onSuccess: () => showToast.success("Student Deleted", "Use Show deleted to restore the student."),
            onError: (err) => showToast.error("Delete Failed", getErrorMessage(err, "Failed to delete student.")),
            onSettled: () => setDeleteId(""),
        });
    };

    const handleRestore = (id: string) => {
        const student = find(id);
        restore.mutate(id, {
            onSuccess: () => showToast.success("Student Restored", `${student ? fullName(student) : "The student"} is back on the roster.`),
            onError: (err) => showToast.error("Restore Failed", getErrorMessage(err, "Failed to restore student.")),
        });
    };

    const hasNarrowingFilters = !!(filters.sectionId || filters.standing || filters.enrolled);
    const clearAll = () => {
        clearRosterFilters();
        setRosterFilter("search", "");
        setSearchInput("");
    };
    const isRefreshing = query.isFetching && query.isPlaceholderData;
    const sectionLabel = sections.find((s) => s.id === filters.sectionId);

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {/* Toolbar */}
            <div className="space-y-3 border-b border-slate-200 px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Student roster</h2>
                        <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500" aria-live="polite">
                            <span>
                                {total} student{total === 1 ? "" : "s"}
                                {sectionLabel && ` in ${sectionLabel.code} (${sectionLabel.schoolYear})`}
                                {showDeleted && ", including deleted"}
                                {" · standing is computed from warnings and marks"}
                            </span>
                            {isRefreshing && <Loader2 className="h-3 w-3 animate-spin text-slate-400" aria-label="Updating" />}
                        </p>
                    </div>
                    <div className="flex flex-col flex-wrap items-stretch gap-2 sm:flex-row sm:items-center lg:justify-end">
                        <SearchBar onChangeValue={setSearchInput} defaultValue={filters.search} placeholder="Search by name or student no." />
                        {canManage && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsImportOpen(true)}
                                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-emerald-800"
                                >
                                    <FileSpreadsheet className="h-4 w-4" />
                                    Import roster
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAddOpen(true)}
                                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add student
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col flex-wrap gap-2 sm:flex-row sm:items-center">
                    <select
                        aria-label="Section"
                        value={filters.sectionId}
                        onChange={(e) => setRosterFilter("sectionId", e.target.value)}
                        className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:border-blue-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20"
                    >
                        <option value="">All sections</option>
                        {sections.map((section) => (
                            <option key={section.id} value={section.id}>{section.code} · {section.schoolYear}</option>
                        ))}
                    </select>
                    <div className="inline-flex shrink-0 rounded-lg bg-slate-100 p-1" role="group" aria-label="Standing">
                        {STANDING_FILTERS.map(({ value, label }) => (
                            <button key={value || "all"} type="button" aria-pressed={filters.standing === value} onClick={() => setRosterFilter("standing", value)} className={segmentClass(filters.standing === value)}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="inline-flex shrink-0 rounded-lg bg-slate-100 p-1" role="group" aria-label="Fingerprint enrollment">
                        {ENROLLMENT_FILTERS.map(({ value, label }) => (
                            <button key={value || "any"} type="button" aria-pressed={filters.enrolled === value} onClick={() => setRosterFilter("enrolled", value)} className={segmentClass(filters.enrolled === value)}>
                                {label}
                            </button>
                        ))}
                    </div>
                    {canManage && (
                        <div className="sm:ml-auto">
                            <ShowDeletedToggle checked={filters.showDeleted} onChange={(value) => setRosterFilter("showDeleted", value)} />
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <div className={`max-h-[60vh] min-h-[45vh] overflow-y-auto transition-opacity ${isRefreshing ? "opacity-60" : ""}`}>
                    {query.isPending ? (
                        <div className="flex items-center justify-center py-24 text-slate-400">
                            <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading students" />
                        </div>
                    ) : query.isError && !page ? (
                        <div role="alert" className="flex flex-col items-center justify-center px-8 py-20 text-center">
                            <h3 className="text-sm font-semibold text-slate-900">Could not load students</h3>
                            <p className="mt-1 text-sm text-slate-500">{getErrorMessage(query.error, "Unknown error")}</p>
                            <button type="button" onClick={() => query.refetch()} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline">
                                <RotateCcw className="h-3.5 w-3.5" /> Try again
                            </button>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
                            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                {hasNarrowingFilters || filters.search ? <Search className="h-5 w-5 text-slate-400" /> : <GraduationCap className="h-5 w-5 text-slate-400" />}
                            </span>
                            <h3 className="text-sm font-semibold text-slate-900">No students found</h3>
                            <p className="mt-1 max-w-sm text-sm text-slate-500">Adjust the filters, add a student, or import a roster file.</p>
                            {(hasNarrowingFilters || filters.search) && (
                                <button type="button" onClick={clearAll} className="mt-4 text-sm font-medium text-blue-600 hover:underline">
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead>
                                <tr className="sticky top-0 z-10 bg-slate-50">
                                    {HEADERS.map((h) => (
                                        <th key={h} className="border-b border-slate-200 px-6 py-3 font-medium text-slate-500">{h}</th>
                                    ))}
                                    <th className="w-12 border-b border-slate-200 px-6 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.map((student) => (
                                    <tr
                                        key={student.id}
                                        onClick={() => setViewId(student.id)}
                                        className={`group cursor-pointer transition-colors ${
                                            student.deletedAt ? "bg-slate-50/60 hover:bg-slate-50" : student.standing === "BLOCKED" ? "bg-rose-50/40 hover:bg-rose-50/70" : "hover:bg-slate-50"
                                        }`}
                                    >
                                        <StudentTable
                                            student={student}
                                            onEdit={setEditId}
                                            onEnroll={setEnrollId}
                                            onDelete={setDeleteId}
                                            onRestore={handleRestore}
                                            isRestoring={restore.isPending && restore.variables === student.id}
                                        />
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Pagination
                totalPages={totalPages}
                currentPage={Math.min(rosterPage, totalPages)}
                totalItems={total}
                itemsPerPage={PAGE_SIZE}
                handlePageChange={setRosterPage}
            />

            <p className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
                Click a student to see warnings, marks, holds and liabilities. Fingerprint templates never leave the server.
            </p>

            {viewStudent && <ViewStudentCredentials student={viewStudent} isOpen onClose={() => setViewId("")} />}
            {isAddOpen && <EditStudent onClose={() => setIsAddOpen(false)} />}
            {isImportOpen && <ImportRosterDialog onClose={() => setIsImportOpen(false)} />}
            {editStudent && <EditStudent student={editStudent} onClose={() => setEditId("")} />}
            {enrollStudent && (
                <EnrollFingerprintModal
                    studentId={enrollStudent.id}
                    studentName={fullName(enrollStudent)}
                    enrolledFingerCount={enrollStudent.enrolledFingerCount}
                    onClose={() => setEnrollId("")}
                />
            )}
            {deleteId && (
                <PopUpModal
                    title="Delete Student"
                    label="delete"
                    noun="student"
                    destination="Show deleted filter on Students"
                    onHandleCancelAction={() => setDeleteId("")}
                    onHandleConfirmAction={confirmDelete}
                    isLoading={isDeleting}
                />
            )}
        </section>
    );
}
