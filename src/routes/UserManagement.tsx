import { useCallback, useMemo } from "react";
import { AddUsers } from "../components/AddUser";
import EditUser from "../components/EditUser";
import SearchBar from "../components/SearchBar";
import { SelectUserStatus } from "../components/SelectUserStatus";
import { UserSkeletonLoader } from "../loader/UserSkeletonLoader";
import { useArchiveUser, useBlockUser, useUnblockUser } from "../hooks/userHooks";
import UserTable from "../components/UserTable";
import ErrorTable from "../components/ErrorTables";
import PopUpModal from "../components/PopUpModal";
import BlockUserModal from "../components/BlockUserModal";
import ViewUserCredentials from "../components/ViewUserCredentials";
import { showToast } from "../components/AppToast";
import { useAllUsersManagement, useFilteredUser } from "../data/user-management-data";
import { useAllUsersManagementState } from "../states/user-management-state";
import RegistrationModule from "../components/RegistrationModule";
import { USER_MANAGEMENT_CONTENT as T } from "../constants/userManagementContent";
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  GraduationCap,
  Info,
  UserPlus,
  Wifi,
} from "lucide-react";

export default function UserManagement() {
  const {
    activeTab,
    setActiveTab,
    isAddUserOpen,
    setIsAddUserOpen,
    isEditUserOpen,
    setIsEditUserOpen,
    isViewCredentialsOpen,
    setIsViewCredentialsOpen,
    isArchiveModalOpen,
    setIsArchiveModalOpen,
    isBlockModalOpen,
    setIsBlockModalOpen,
    selectedUserId,
    setSelectedUserId,
    archiveUserId,
    setArchiveUserId,
    blockUserId,
    setBlockUserId,
  } = useAllUsersManagementState();

  const { mutate, isPending: isArchiving } = useArchiveUser();
  const { mutate: blockUser, isPending: isBlocking } = useBlockUser();
  const { mutate: unblockUser } = useUnblockUser();
  const { users, isPending, isError } = useAllUsersManagement();
  const { filteredUser, setSearchUser, setSelectedStatus, selectedRole, setSelectedRole } = useFilteredUser();

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId),
    [users, selectedUserId],
  );

  const blockUserData = useMemo(
    () => users.find((u) => u.id === blockUserId),
    [users, blockUserId],
  );

  const confirmArchiveUser = useCallback(() => {
    mutate(archiveUserId, {
      onSuccess: (d) => {
        setIsArchiveModalOpen(false);
        setArchiveUserId("");
        showToast.success(T.toast.archivedTitle, d.message);
      },
      onError: () => {
        setIsArchiveModalOpen(false);
        setArchiveUserId("");
        showToast.error(T.toast.actionFailed, T.toast.cannotArchiveSelf);
      },
    });
  }, [archiveUserId, mutate, setIsArchiveModalOpen, setArchiveUserId]);

  const cancelArchiveUser = () => {
    setIsArchiveModalOpen(false);
    setArchiveUserId("");
  };

  const handleViewUserCredentials = (id: string) => {
    setSelectedUserId(id);
    setIsViewCredentialsOpen(true);
  };

  const handleBlockUser = (id: string) => {
    setBlockUserId(id);
    setIsBlockModalOpen(true);
  };

  const handleUnblockUser = (id: string) => {
    unblockUser(id, {
      onSuccess: () => {
        showToast.success(T.toast.unblockedTitle, T.toast.unblockedMessage);
      },
      onError: (error: any) => {
        showToast.error(T.toast.actionFailed, error?.response?.data?.message || T.toast.unblockFailed);
      },
    });
  };

  const confirmBlockUser = (data: { reason: string; isPermanent: boolean; blockedUntil?: string }) => {
    blockUser(
      { id: blockUserId, data },
      {
        onSuccess: () => {
          setIsBlockModalOpen(false);
          setBlockUserId("");
          showToast.success(T.toast.blockedTitle, T.toast.blockedMessage);
        },
        onError: (error: any) => {
          setIsBlockModalOpen(false);
          setBlockUserId("");
          showToast.error(T.toast.actionFailed, error?.response?.data?.message || T.toast.blockFailed);
        },
      },
    );
  };

  const cancelBlockUser = () => {
    setIsBlockModalOpen(false);
    setBlockUserId("");
  };

  const tableUsers = filteredUser.filter(
    (user) => (user.userRole === "Admin" || user.userRole === "Staff") && user.status?.toLowerCase() !== "archived",
  );

  const staffUsers = users.filter((u) => u.userRole === "Staff" && u.status?.toLowerCase() !== "archived");
  const adminUsers = users.filter((u) => u.userRole === "Admin" && u.status?.toLowerCase() !== "archived");
  const staffOnlineCount = staffUsers.filter((u) => u.status?.toLowerCase() === "online").length;
  const adminOnlineCount = adminUsers.filter((u) => u.status?.toLowerCase() === "online").length;
  const totalAccounts = staffUsers.length + adminUsers.length;
  const totalOnline = staffOnlineCount + adminOnlineCount;
  const totalBlocked = [...staffUsers, ...adminUsers].filter((u) => u.isBlocked).length;

  const stats = [
    { label: T.stats.total, value: totalAccounts, sub: T.stats.blockedSub(totalBlocked), icon: Users },
    { label: T.stats.admins, value: adminUsers.length, sub: T.stats.onlineSub(adminOnlineCount), icon: ShieldCheck },
    { label: T.stats.staff, value: staffUsers.length, sub: T.stats.onlineSub(staffOnlineCount), icon: Shield },
    {
      label: T.stats.online,
      value: totalOnline,
      sub: T.stats.onlineShare(totalAccounts ? Math.round((totalOnline / totalAccounts) * 100) : 0),
      icon: Wifi,
    },
  ];

  const tabs = [
    { id: "staff" as const, label: T.tabs.staff, icon: ShieldCheck },
    { id: "registered" as const, label: T.tabs.registered, icon: GraduationCap },
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
          <button
            type="button"
            onClick={() => setIsAddUserOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4" />
            {T.newUser}
          </button>
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
                <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{stat.value}</p>
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

        {/* ── Staff & Admins tab ── */}
        {activeTab === "staff" && (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

            {/* Toolbar */}
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{T.tableTitle}</h2>
                <p className="mt-0.5 text-xs text-slate-500">{T.countLabel(tableUsers.length)}</p>
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
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <div className="max-h-[60vh] min-h-[45vh] overflow-y-auto">
                {isError ? (
                  <ErrorTable />
                ) : tableUsers.length === 0 ? (
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
                      {tableUsers.map((user) => (
                        <tr
                          key={user.id}
                          onClick={() => handleViewUserCredentials(user.id)}
                          className={`group cursor-pointer transition-colors ${
                            user.isBlocked ? "bg-rose-50/40 hover:bg-rose-50/70" : "hover:bg-slate-50"
                          }`}
                        >
                          <UserTable
                            id={user.id}
                            firstName={user.firstName}
                            lastName={user.lastName}
                            username={user.username}
                            email={user.email}
                            userRole={user.userRole}
                            status={user.status}
                            isBlocked={user.isBlocked}
                            onSetEditUserId={(userId) => {
                              setSelectedUserId(userId);
                              setIsEditUserOpen(true);
                            }}
                            onSetIsEditUserOpen={setIsEditUserOpen}
                            onMutate={(userId) => {
                              setArchiveUserId(userId);
                              setIsArchiveModalOpen(true);
                            }}
                            onBlockUser={handleBlockUser}
                            onUnblockUser={handleUnblockUser}
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

        {/* ── Registered Users tab ── */}
        {activeTab === "registered" && (
          <RegistrationModule embedded />
        )}
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

      {isArchiveModalOpen && (
        <PopUpModal
          title={T.archiveModal.title}
          label={T.archiveModal.label}
          noun={T.archiveModal.noun}
          destination={T.archiveModal.destination}
          onHandleCancelAction={cancelArchiveUser}
          onHandleConfirmAction={confirmArchiveUser}
          isLoading={isArchiving}
        />
      )}

      {blockUserData && (
        <BlockUserModal
          isOpen={isBlockModalOpen}
          onClose={cancelBlockUser}
          onConfirm={confirmBlockUser}
          userName={`${blockUserData.firstName} ${blockUserData.lastName}`}
          isLoading={isBlocking}
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
