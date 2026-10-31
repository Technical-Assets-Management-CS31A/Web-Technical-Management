import { useState } from "react";
import { GraduationCap, Plus, Search } from "lucide-react";
import { EditStudent } from "./EditStudent";
import SearchBar from "./SearchBar";
import { StudentTable } from "./StudentTable";
import ViewStudentCredentials from "./ViewStudentCredentials";
import EnrollFingerprintModal from "./EnrollFingerprintModal";
import PopUpModal from "./PopUpModal";
import ErrorTable from "./ErrorTables";
import { showToast } from "./AppToast";
import ImportStudentsButton from "./ImportStudentsButton";
import { useDeleteStudent } from "../hooks/userHooks";
import { useStudentRoster } from "../data/user-management-data";
import { UserData, canManageRoster } from "../utils/usersData/userData";
import { fullName } from "../lib/utils";
import { getErrorMessage } from "./form/FormKit";
import type { StudentStanding } from "../@types/types";

const STANDING_FILTERS: { value: StudentStanding | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "GOOD", label: "Good" },
    { value: "WARNED", label: "Warned" },
    { value: "BLOCKED", label: "Blocked" },
];

const HEADERS = ["Student", "Section", "Standing", "Warnings / Marks", "Fingerprint", "Status"];

// Students are roster records with no login (PRD). Staff add them here or import a roster file.
export default function StudentRoster() {
    const viewer = UserData();
    const { filteredStudents, isError, setSearchStudent, selectedStanding, setSelectedStanding } = useStudentRoster();
    const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent();

    const [viewId, setViewId] = useState("");
    const [editId, setEditId] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [enrollId, setEnrollId] = useState("");
    const [deleteId, setDeleteId] = useState("");

    const find = (id: string) => filteredStudents.find((s) => s.id === id);
    const viewStudent = find(viewId);
    const editStudent = find(editId);
    const enrollStudent = find(enrollId);

    const confirmDelete = () => {
        deleteStudent(deleteId, {
            onSuccess: () => showToast.success("Student Deleted", "The student was removed from the roster."),
            onError: (err) => showToast.error("Delete Failed", getErrorMessage(err, "Failed to delete student.")),
            onSettled: () => setDeleteId(""),
        });
    };

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-900">Student roster</h2>
                    <p className="mt-0.5 text-xs text-slate-500">{filteredStudents.length} student{filteredStudents.length === 1 ? "" : "s"} · standing is computed from warnings and marks</p>
                </div>
                <div className="flex flex-col flex-wrap items-stretch gap-2 sm:flex-row sm:items-center lg:justify-end">
                    <div className="inline-flex shrink-0 rounded-lg bg-slate-100 p-1">
                        {STANDING_FILTERS.map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setSelectedStanding(value)}
                                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                                    selectedStanding === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <SearchBar onChangeValue={setSearchStudent} placeholder="Search by name, student no. or section" />
                    {canManageRoster(viewer.role) && (
                        <>
                            <ImportStudentsButton />
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

            {/* Table */}
            <div className="overflow-x-auto">
                <div className="max-h-[60vh] min-h-[45vh] overflow-y-auto">
                    {isError ? (
                        <ErrorTable />
                    ) : filteredStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
                            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                {selectedStanding === "all" ? <GraduationCap className="h-5 w-5 text-slate-400" /> : <Search className="h-5 w-5 text-slate-400" />}
                            </span>
                            <h3 className="text-sm font-semibold text-slate-900">No students found</h3>
                            <p className="mt-1 max-w-sm text-sm text-slate-500">Adjust the filters, add a student, or import a roster file.</p>
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
                                {filteredStudents.map((student) => (
                                    <tr
                                        key={student.id}
                                        onClick={() => setViewId(student.id)}
                                        className={`group cursor-pointer transition-colors ${student.standing === "BLOCKED" ? "bg-rose-50/40 hover:bg-rose-50/70" : "hover:bg-slate-50"}`}
                                    >
                                        <StudentTable student={student} onEdit={setEditId} onEnroll={setEnrollId} onDelete={setDeleteId} />
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <p className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
                Click a student to see warnings, marks, holds and liabilities. Fingerprint templates never leave the server.
            </p>

            {viewStudent && <ViewStudentCredentials student={viewStudent} isOpen onClose={() => setViewId("")} />}
            {isAddOpen && <EditStudent onClose={() => setIsAddOpen(false)} />}
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
                    destination="Deleted records page"
                    onHandleCancelAction={() => setDeleteId("")}
                    onHandleConfirmAction={confirmDelete}
                    isLoading={isDeleting}
                />
            )}
        </section>
    );
}
