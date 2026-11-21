import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AddUsers } from "../components/AddUser";
import EditUser from "../components/EditUser";
import SearchBar from "../components/SearchBar";
import { SelectUserStatus } from "../components/SelectUserStatus";
import { UserSkeletonLoader } from "../loader/UserSkeletonLoader";
import { useDeleteUser, useRestoreUser, useStudentCount } from "../hooks/userHooks";
import UserTable from "../components/UserTable";
import ErrorTable from "../components/ErrorTables";
import PopUpModal from "../components/PopUpModal";
import ViewUserCredentials from "../components/ViewUserCredentials";
import { showToast } from "../components/AppToast";
import { getErrorMessage } from "../components/form/FormKit";
import { useAllUsersManagement, useFilteredUser } from "../data/user-management-data";
import { useAllUsersManagementState } from "../states/user-management-state";
import StudentRoster from "../components/StudentRoster";
import SectionsPanel from "../components/SectionsPanel";
import { ShowDeletedToggle } from "../components/DeletedRecords";
import { UserData, canManageAccounts } from "../utils/usersData/userData";
import { USER_MANAGEMENT_CONTENT as T } from "../constants/userManagementContent";
import {
  Fingerprint,
  Layers,
  ShieldAlert,
  ShieldX,
  Users,
  Search,
  Shield,
  Snowflake,
  GraduationCap,
  Info,
  UserPlus,
  Presentation,
} from "lucide-react";

export default function UserManagement() {
  const viewer = UserData();
  const {
    activeTab,
    setActiveTab,
    isAddUserOpen,
    setIsAddUserOpen,
    isEditUserOpen,
    setIsEditUserOpen,
    isViewCredentialsOpen,
    setIsViewCredentialsOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    selectedUserId,
    setSelectedUserId,
    deleteUserId,
    setDeleteUserId,
    showDeletedAccounts,
    setShowDeletedAccounts,
  } = useAllUsersManagementState();

  const canManage = canManageAccounts(viewer.role);
  const showDeleted = canManage && showDeletedAccounts;
  const { mutate, isPending: isDeleting } = useDeleteUser();
  const restoreUser = useRestoreUser();
  const { users, isPending, isError } = useAllUsersManagement(showDeleted);
  const { filteredUser, setSearchUser, setSelectedStatus, selectedRole, setSelectedRole } = useFilteredUser(users, showDeleted);

  // Roster summary (server counts, so they cover every page).
  const studentTotal = useQuery(useStudentCount());
  const notEnrolled = useQuery(useStudentCount({ enrolled: false }));
  const warned = useQuery(useStudentCount({ standing: "WARNED" }));
  const blocked = useQuery(useStudentCount({ standing: "BLOCKED" }));

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId),
    [users, selectedUserId],
  );

  const confirmDeleteUser = useCallback(() => {
    mutate(deleteUserId, {
      onSuccess: () => {
        showToast.success(T.toast.deletedTitle, T.toast.deletedMessage);
      },
      onError: (err) => {
        showToast.error(T.toast.actionFailed, getErrorMessage(err, T.toast.deleteFailed));
      },
      onSettled: () => {
        setIsDeleteModalOpen(false);
        setDeleteUserId("");
      },
    });
  }, [deleteUserId, mutate, setIsDeleteModalOpen, setDeleteUserId]);

  const cancelDeleteUser = () => {
    setIsDeleteModalOpen(false);
    setDeleteUserId("");
  };

  const handleRestoreUser = (id: string) => {
    const user = users.find((u) => u.id === id);
    restoreUser.mutate(id, {
      onSuccess: () => showToast.success(T.toast.restoredTitle, T.toast.restoredMessage(user ? user.email : "")),
      onError: (err) => showToast.error(T.toast.actionFailed, getErrorMessage(err, T.toast.restoreFailed)),
    });
  };

  const handleViewUserCredentials = (id: string) => {
    setSelectedUserId(id);
    setIsViewCredentialsOpen(true);
  };

  const liveUsers = users.filter((u) => !u.deletedAt);
  const instructors = liveUsers.filter((u) => u.role === "INSTRUCTOR");
  const staff = liveUsers.filter((u) => u.role !== "INSTRUCTOR");
  const frozenCount = instructors.filter((u) => u.isFrozen).length;
  const noCardCount = instructors.filter((u) => !u.authCards?.some((c) => c.status === "ACTIVE")).length;
  const activeCount = (list: typeof users) => list.filter((u) => u.status === "ACTIVE").length;

  const accountStats = [
    { label: T.stats.total, value: liveUsers.length, sub: T.stats.activeSub(activeCount(liveUsers)), icon: Users },
    { label: T.stats.staff, value: staff.length, sub: T.stats.activeSub(activeCount(staff)), icon: Shield },
    { label: T.stats.instructors, value: instructors.length, sub: T.stats.noCardSub(noCardCount), icon: Presentation },
    { label: T.stats.frozen, value: frozenCount, sub: T.stats.frozenSub, icon: Snowflake },
  ];
  const studentStats = [
    { label: T.stats.students, value: studentTotal.data, sub: T.stats.studentsSub, icon: GraduationCap },
    { label: T.stats.notEnrolled, value: notEnrolled.data, sub: T.stats.notEnrolledSub, icon: Fingerprint },
    { label: T.stats.warned, value: warned.data, sub: T.stats.warnedSub, icon: ShieldAlert },
    { label: T.stats.blocked, value: blocked.data, sub: T.stats.blockedSub, icon: ShieldX },
  ];
  const stats = activeTab === "accounts" ? accountStats : studentStats;

  const tabs = [
    { id: "accounts" as const, label: T.tabs.accounts, icon: Users },
    { id: "students" as const, label: T.tabs.students, icon: GraduationCap },
    { id: "sections" as const, label: T.tabs.sections, icon: Layers },
  ];

  if (isPending) return <UserSkeletonLoader />;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">

        {/* Header */}
        <header className="flex flex-col gap-4 mt-12 md:mt-0 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">{T.badge}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">{T.description}</p>
          </div>
          {canManage && activeTab === "accounts" && <button
            type="button"
            onClick={() => setIsAddUserOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4" />
            {T.newUser}
          </button>}
        </header>

        {/* Summary */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-500">{stat.label}</p>
                <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
                  {stat.value === undefined ? <span className="text-slate-300">—</span> : stat.value.toLocaleString()}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-400">{stat.sub}</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <stat.icon className="h-5 w-5" />
              </span>
            </div>
          ))}
        </section>

        {/* Tab switcher */}
        <div className="inline-flex w-full rounded-lg bg-slate-200/60 p-1 sm:w-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all sm:flex-none ${
                  isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Accounts tab ── */}
        {activeTab === "accounts" && (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

            {/* Toolbar */}
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{T.tableTitle}</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {T.countLabel(filteredUser.length)}
                  {showDeleted && T.includingDeleted}
                </p>
              </div>

              <div className="flex flex-col flex-wrap items-stretch gap-2 sm:flex-row sm:items-center lg:justify-end">
                <div className="inline-flex shrink-0 rounded-lg bg-slate-100 p-1">
                  {T.roleFilters.map(({ value: role, label }) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedRole === role
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="shrink-0">
                  <SelectUserStatus onChangeStatus={setSelectedStatus} />
                </div>
                <SearchBar
                  onChangeValue={(value) => setSearchUser(value)}
                  name={T.searchName}
                  placeholder={T.searchPlaceholder}
                />
                {canManage && <ShowDeletedToggle checked={showDeletedAccounts} onChange={setShowDeletedAccounts} />}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <div className="max-h-[60vh] min-h-[45vh] overflow-y-auto">
                {isError ? (
                  <ErrorTable />
                ) : filteredUser.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <Search className="h-5 w-5 text-slate-400" />
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900">{T.empty.title}</h3>
                    <p className="mt-1 max-w-sm text-sm text-slate-500">{T.empty.description}</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="sticky top-0 z-10 bg-slate-50">
                        {T.tableHeaders.map((col) => (
                          <th key={col} className="border-b border-slate-200 px-5 py-3 font-medium text-slate-500">
                            {col}
                          </th>
                        ))}
                        <th className="w-12 border-b border-slate-200 px-5 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUser.map((user) => (
                        <tr
                          key={user.id}
                          onClick={() => handleViewUserCredentials(user.id)}
                          className={`group cursor-pointer transition-colors ${
                            user.deletedAt ? "bg-slate-50/60 hover:bg-slate-50" : user.isFrozen ? "bg-sky-50/40 hover:bg-sky-50/70" : "hover:bg-slate-50"
                          }`}
                        >
                          <UserTable
                            user={user}
                            onEdit={(userId) => {
                              setSelectedUserId(userId);
                              setIsEditUserOpen(true);
                            }}
                            onDelete={(userId) => {
                              setDeleteUserId(userId);
                              setIsDeleteModalOpen(true);
                            }}
                            onRestore={handleRestoreUser}
                            isRestoring={restoreUser.isPending && restoreUser.variables === user.id}
                          />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Footer hint */}
            <p className="flex items-start gap-2 border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
              <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>{T.tip.text}</span>
            </p>
          </section>
        )}

        {/* ── Students tab ── */}
        {activeTab === "students" && <StudentRoster />}

        {/* ── Sections tab ── */}
        {activeTab === "sections" && <SectionsPanel />}
      </div>

      {/* Modals */}
      {isAddUserOpen && (
        <AddUsers onClose={() => setIsAddUserOpen(false)} />
      )}

      {isEditUserOpen && selectedUser && (
        <EditUser
          user={selectedUser}
          onClose={() => setIsEditUserOpen(false)}
        />
      )}

      {isDeleteModalOpen && (
        <PopUpModal
          title={T.deleteModal.title}
          label={T.deleteModal.label}
          noun={T.deleteModal.noun}
          destination={T.deleteModal.destination}
          onHandleCancelAction={cancelDeleteUser}
          onHandleConfirmAction={confirmDeleteUser}
          isLoading={isDeleting}
        />
      )}

      {selectedUser && isViewCredentialsOpen && (
        <ViewUserCredentials
          user={selectedUser}
          isOpen={isViewCredentialsOpen}
          onClose={() => setIsViewCredentialsOpen(false)}
        />
      )}
    </div>
  );
}
