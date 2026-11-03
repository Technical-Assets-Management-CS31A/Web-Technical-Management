import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import ArchiveSkeletonLoader from "../loader/ArchiveSkeletonLoader.tsx";
import { useAllAssets, useRestoreAsset } from "../hooks/assetHooks.ts";
import { useAllStudents, useAllUsers, useRestoreStudent, useRestoreUser } from "../hooks/userHooks.ts";
import ErrorTable from "../components/ErrorTables.tsx";
import SearchBar from "../components/SearchBar.tsx";
import Pagination from "../components/Pagination.tsx";
import PopUpModal from "../components/PopUpModal.tsx";
import { RoleBadge, StatusBadge, UserIdentity } from "../components/ArchiveCells.tsx";
import ViewUserCredentials from "../components/ViewUserCredentials.tsx";
import ViewStudentCredentials from "../components/ViewStudentCredentials.tsx";
import { FormattedDateTime } from "../components/FormattedDateTime.ts";
import { showToast } from "../components/AppToast";
import { getErrorMessage } from "../components/form/FormKit";
import { formatEnum, fullName } from "../lib/utils";
import { UserData, canManageAccounts, canManageAssets, canManageRoster } from "../utils/usersData/userData";
import { ARCHIVE_CONTENT as T } from "../constants/archiveContent";
import { Package, Users, GraduationCap, RotateCcw, Search, type LucideIcon } from "lucide-react";

// Soft delete (PRD): records stay in place with deletedAt set. This page lists them and can restore them.

type FilterKey = "assets" | "accounts" | "students";

const filterTabs: { key: FilterKey; label: string; icon: LucideIcon }[] = [
  { key: "assets", label: T.tabs.assets, icon: Package },
  { key: "accounts", label: T.tabs.accounts, icon: Users },
  { key: "students", label: T.tabs.students, icon: GraduationCap },
];

const itemsPerPage = 10;

const thClass = "border-b border-slate-200 px-5 py-3 font-medium text-slate-500";

const byDeletedAt = <R extends { deletedAt: string | null }>(a: R, b: R) =>
  new Date(b.deletedAt ?? 0).getTime() - new Date(a.deletedAt ?? 0).getTime();

export default function Archive() {
  const navigate = useNavigate();
  const viewer = UserData();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("assets");
  const [searchItem, setSearchItem] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [restoreTarget, setRestoreTarget] = useState<{ kind: FilterKey; id: string } | null>(null);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [viewStudentId, setViewStudentId] = useState<string | null>(null);

  const assetsQuery = useQuery(useAllAssets(true));
  const usersQuery = useQuery(useAllUsers(true));
  const studentsQuery = useQuery(useAllStudents(true));
  const restoreAsset = useRestoreAsset();
  const restoreUser = useRestoreUser();
  const restoreStudent = useRestoreStudent();

  const deletedAssets = useMemo(() => (assetsQuery.data ?? []).filter((a) => a.deletedAt).sort(byDeletedAt), [assetsQuery.data]);
  const deletedUsers = useMemo(() => (usersQuery.data ?? []).filter((u) => u.deletedAt).sort(byDeletedAt), [usersQuery.data]);
  const deletedStudents = useMemo(() => (studentsQuery.data ?? []).filter((s) => s.deletedAt).sort(byDeletedAt), [studentsQuery.data]);

  const term = searchItem.toLowerCase();
  const filteredAssets = useMemo(
    () => deletedAssets.filter((a) => `${a.name} ${a.assetCode} ${a.category?.name ?? ""}`.toLowerCase().includes(term)),
    [deletedAssets, term],
  );
  const filteredUsers = useMemo(
    () => deletedUsers.filter((u) => `${fullName(u)} ${u.email} ${u.employeeNo}`.toLowerCase().includes(term)),
    [deletedUsers, term],
  );
  const filteredStudents = useMemo(
    () => deletedStudents.filter((st) => `${fullName(st)} ${st.studentNo} ${st.section?.code ?? ""}`.toLowerCase().includes(term)),
    [deletedStudents, term],
  );
  const rowCount = { assets: filteredAssets.length, accounts: filteredUsers.length, students: filteredStudents.length }[activeFilter];

  const tabCounts: Record<FilterKey, number> = {
    assets: deletedAssets.length,
    accounts: deletedUsers.length,
    students: deletedStudents.length,
  };

  const canRestore: Record<FilterKey, boolean> = {
    assets: canManageAssets(viewer.role),
    accounts: canManageAccounts(viewer.role),
    students: canManageRoster(viewer.role),
  };

  const totalPages = Math.ceil(rowCount / itemsPerPage);
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  const pageSlice = <R,>(list: R[]) => list.slice((validCurrentPage - 1) * itemsPerPage, validCurrentPage * itemsPerPage);

  const handleTabChange = (key: FilterKey) => {
    setActiveFilter(key);
    setCurrentPage(1);
    setSearchItem("");
  };

  const confirmRestore = () => {
    if (!restoreTarget) return;
    const mutation = restoreTarget.kind === "assets" ? restoreAsset : restoreTarget.kind === "accounts" ? restoreUser : restoreStudent;
    mutation.mutate(restoreTarget.id, {
      onSuccess: () => showToast.success(T.toast.restored, T.toast.restoredMessage),
      onError: (err) => showToast.error(T.toast.restoreFailed, getErrorMessage(err, T.toast.restoreFailed)),
      onSettled: () => setRestoreTarget(null),
    });
  };

  const activeTab = filterTabs.find((t) => t.key === activeFilter) ?? filterTabs[0];
  const activeLabel = activeTab.label.toLowerCase();
  const isEmpty = tabCounts[activeFilter] === 0;
  const hasError = assetsQuery.isError || usersQuery.isError || studentsQuery.isError;
  const isRestoring = restoreAsset.isPending || restoreUser.isPending || restoreStudent.isPending;

  if (assetsQuery.isPending || usersQuery.isPending || studentsQuery.isPending) return <ArchiveSkeletonLoader />;

  const headers = T.headers[activeFilter];
  const restoreButton = (kind: FilterKey, id: string) =>
    canRestore[kind] && (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setRestoreTarget({ kind, id }); }}
        disabled={isRestoring}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {T.rowActions.restore}
      </button>
    );

  const viewUser = deletedUsers.find((u) => u.id === viewUserId);
  const viewStudent = deletedStudents.find((s) => s.id === viewStudentId);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8">

        {/* Header */}
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{T.description}</p>
        </header>

        {/* Stats — doubles as the tab switcher */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {filterTabs.map(({ key, icon: Icon }) => {
            const isActive = activeFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleTabChange(key)}
                disabled={hasError}
                aria-pressed={isActive}
                className={`flex items-center justify-between gap-4 rounded-xl border bg-white p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-default ${
                  isActive
                    ? "border-blue-500 ring-1 ring-blue-500"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="min-w-0">
                  <p className={`text-sm ${isActive ? "font-medium text-blue-700" : "text-slate-500"}`}>
                    {T.stats[key].label}
                  </p>
                  <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
                    {tabCounts[key]}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">{T.stats[key].hint}</p>
                </div>
                <span
                  className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:flex ${
                    isActive ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </button>
            );
          })}
        </section>

        {/* Table card */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{T.table.title(activeLabel)}</h2>
              <p className="text-sm text-slate-500">{T.table.count(rowCount, activeLabel)}</p>
            </div>
            <SearchBar
              key={activeFilter}
              onChangeValue={(value) => { setSearchItem(value); setCurrentPage(1); }}
              name="search"
              placeholder={T.searchPlaceholder(activeLabel)}
            />
          </div>

          {/* Table body */}
          <div className="overflow-x-auto">
            <div className="max-h-[60vh] min-h-[50vh] overflow-y-auto">
              {hasError ? (
                <ErrorTable />
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="sticky top-0 z-10 bg-slate-50">
                      {headers.map((h) => (
                        <th key={h} className={thClass}>{h}</th>
                      ))}
                      <th className={`${thClass} w-16`} />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rowCount === 0 ? (
                      <tr>
                        <td colSpan={headers.length + 1}>
                          <EmptyState icon={activeTab.icon} label={activeLabel} isEmpty={isEmpty} />
                        </td>
                      </tr>
                    ) : activeFilter === "assets" ? (
                      pageSlice(filteredAssets).map((asset) => (
                        <tr key={asset.id} onClick={() => navigate({ to: "/home/item/$id", params: { id: asset.id } })} className="cursor-pointer transition-colors hover:bg-slate-50">
                          <td className="px-5 py-3">
                            <p className="font-medium text-slate-900">{asset.name}</p>
                            <p className="font-mono text-xs text-slate-500">{asset.assetCode}</p>
                          </td>
                          <td className="px-5 py-3 text-slate-600">{asset.category?.name}</td>
                          <td className="px-5 py-3 text-slate-600">{formatEnum(asset.condition)}</td>
                          <td className="px-5 py-3 text-slate-600">{FormattedDateTime(asset.deletedAt ?? "")}</td>
                          <td className="px-5 py-3 text-right">{restoreButton("assets", asset.id)}</td>
                        </tr>
                      ))
                    ) : activeFilter === "accounts" ? (
                      pageSlice(filteredUsers).map((user) => (
                        <tr key={user.id} onClick={() => setViewUserId(user.id)} className="cursor-pointer transition-colors hover:bg-slate-50">
                          <td className="px-5 py-3"><UserIdentity firstName={user.firstName} lastName={user.lastName} subtitle={user.employeeNo} /></td>
                          <td className="px-5 py-3 text-slate-600">{user.email}</td>
                          <td className="px-5 py-3"><RoleBadge role={user.role} /></td>
                          <td className="px-5 py-3"><StatusBadge status={user.status} /></td>
                          <td className="px-5 py-3 text-slate-600">{FormattedDateTime(user.deletedAt ?? "")}</td>
                          <td className="px-5 py-3 text-right">{restoreButton("accounts", user.id)}</td>
                        </tr>
                      ))
                    ) : (
                      pageSlice(filteredStudents).map((student) => (
                        <tr key={student.id} onClick={() => setViewStudentId(student.id)} className="cursor-pointer transition-colors hover:bg-slate-50">
                          <td className="px-5 py-3"><UserIdentity firstName={student.firstName} lastName={student.lastName} subtitle={student.studentNo} /></td>
                          <td className="px-5 py-3 text-slate-600">{student.section?.code}</td>
                          <td className="px-5 py-3"><StatusBadge status={student.status} /></td>
                          <td className="px-5 py-3 text-slate-600">{FormattedDateTime(student.deletedAt ?? "")}</td>
                          <td className="px-5 py-3 text-right">{restoreButton("students", student.id)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {rowCount > 0 && (
            <Pagination
              totalPages={totalPages}
              currentPage={validCurrentPage}
              totalItems={rowCount}
              itemsPerPage={itemsPerPage}
              handlePageChange={setCurrentPage}
            />
          )}
        </section>
      </div>

      {restoreTarget && (
        <PopUpModal
          title={T.modal.title}
          label="restore"
          noun={T.modal.noun[restoreTarget.kind]}
          onHandleCancelAction={() => setRestoreTarget(null)}
          onHandleConfirmAction={confirmRestore}
          isLoading={isRestoring}
        />
      )}
      {viewUser && <ViewUserCredentials user={viewUser} isOpen onClose={() => setViewUserId(null)} />}
      {viewStudent && <ViewStudentCredentials student={viewStudent} isOpen onClose={() => setViewStudentId(null)} />}
    </div>
  );
}

function EmptyState({ icon: Icon, label, isEmpty }: { icon: LucideIcon; label: string; isEmpty: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        {isEmpty ? <Icon className="h-5 w-5 text-slate-400" /> : <Search className="h-5 w-5 text-slate-400" />}
      </span>
      <h3 className="text-sm font-semibold text-slate-900">{T.empty.title(label)}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {isEmpty ? T.empty.noRecords(label) : T.empty.noMatches(label)}
      </p>
    </div>
  );
}
