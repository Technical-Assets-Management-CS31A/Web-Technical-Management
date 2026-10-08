import { useMemo, useCallback } from "react";
import no_image_svg from "../assets/no-image-svgrepo-com.svg";
import ArchiveSkeletonLoader from "../loader/ArchiveSkeletonLoader.tsx";
import type { TUsers } from "../@types/types.ts";
import { useDeleteItem } from "../hooks/itemHooks.ts";
import { useRestoreItem } from "../hooks/itemHooks.ts";
import { useRestoreUser } from "../hooks/userHooks.ts";
import { useDeleteUser } from "../hooks/userHooks.ts";
import ErrorTable from "../components/ErrorTables.tsx";
import SearchBar from "../components/SearchBar.tsx";
import Pagination from "../components/Pagination.tsx";
import PopUpModal from "../components/PopUpModal.tsx";
import PopUpModalDelete from "../components/PopUpModalDelete.tsx";
import { ArchiveItemTable } from "../components/ArchiveItemTable.tsx";
import { ArchiveTeacherTable } from "../components/ArchiveTeacherTable.tsx";
import { ArchiveStudentTable } from "../components/ArchiveStudentTable.tsx";
import ArchiveRowActions from "../components/ArchiveRowActions.tsx";
import { RoleBadge, StatusBadge, UserIdentity } from "../components/ArchiveCells.tsx";
import ArchiveStudentCredentialsPopup from "../components/ArchiveStudentCredentialsPopup.tsx";
import ArchiveTeacherCredentialsPopup from "../components/ArchiveTeacherCredentialsPopup.tsx";
import ArchiveItemDetailsPopup from "../components/ArchiveItemDetailsPopup.tsx";
import { showToast } from "../components/AppToast";
import {
  useAllItemInArchive,
  useAllUsersInArchive,
  useFilteredItems,
  useFilteredUsers,
} from "../data/archive-data.ts";
import { useArchiveState } from "../states/archive-state.ts";
import { ARCHIVE_CONTENT as T } from "../constants/archiveContent";
import { Package, Users, GraduationCap, BookOpen, Search, type LucideIcon } from "lucide-react";

type TStudentTypes = TUsers;
type TNewUserTypes = Omit<TUsers, "course" | "section" | "year">;

type FilterKey = "items" | "users" | "teachers" | "students";

const filterTabs: { key: FilterKey; label: string; icon: LucideIcon }[] = [
  { key: "items", label: T.tabs.items, icon: Package },
  { key: "users", label: T.tabs.users, icon: Users },
  { key: "teachers", label: T.tabs.teachers, icon: BookOpen },
  { key: "students", label: T.tabs.students, icon: GraduationCap },
];

const itemsPerPage = 10;

const thClass = "border-b border-slate-200 px-5 py-3 font-medium text-slate-500";

export default function Archive() {
  const {
    searchItem,
    setSearchItem,
    currentPage,
    setCurrentPage,
    isRestoreConfirmOpen,
    setIsRestoreConfirmOpen,
    restoreSelectedItemId,
    setRestoreSelectedItemId,
    selectedItemId,
    setSelectedItemId,
    isItemDetailsOpen,
    setIsItemDetailsOpen,
    isDeleteConfirmOpen,
    setIsDeleteItemConfirmOpen,
    deleteSelectedId,
    setDeleteSelectedId,
    isUserRestoreConfirmOpen,
    setIsUserRestoreConfirmOpen,
    userRestoreSelectedId,
    setUserRestoreSelectedId,
    isUserDeleteConfirmOpen,
    setIsUserDeleteConfirmOpen,
    userDeleteSelectedId,
    setUserDeleteSelectedId,
    isStudentCredentialsOpen,
    setIsStudentCredentialsOpen,
    selectedStudentId,
    setSelectedStudentId,
    isTeacherCredentialsOpen,
    setIsTeacherCredentialsOpen,
    selectedTeacherId,
    setSelectedTeacherId,
  } = useArchiveState();

  const restoreItemMutation = useRestoreItem();
  const deleteItemMutation = useDeleteItem();
  const deleteUserMutation = useDeleteUser();
  const restoreUserMutation = useRestoreUser();
  const { archiveItems, isPending, isError } = useAllItemInArchive();
  const { archiveUsers, isUsersPending, isUsersError } = useAllUsersInArchive();
  const { filteredItems } = useFilteredItems({ searchItem });
  const { filteredUsers, activeFilter, setActiveFilter, setSelectedCategory } =
    useFilteredUsers({ searchItem });

  const tabCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      items: archiveItems.length,
      users: 0,
      teachers: 0,
      students: 0,
    };
    for (const user of archiveUsers) {
      const role = user.userRole?.toLowerCase();
      if (role === "admin" || role === "staff") counts.users++;
      else if (role === "teacher") counts.teachers++;
      else if (role === "student") counts.students++;
    }
    return counts;
  }, [archiveItems, archiveUsers]);

  const activeCount = activeFilter === "items" ? filteredItems.length : filteredUsers.length;
  const totalPages = Math.ceil(activeCount / itemsPerPage);
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  const paginatedItems = useMemo(
    () =>
      filteredItems
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice((validCurrentPage - 1) * itemsPerPage, validCurrentPage * itemsPerPage),
    [filteredItems, validCurrentPage],
  );

  const paginatedUsers = useMemo(
    () => filteredUsers.slice((validCurrentPage - 1) * itemsPerPage, validCurrentPage * itemsPerPage),
    [filteredUsers, validCurrentPage],
  );

  const handlePageChange = useCallback((page: number) => setCurrentPage(page), [setCurrentPage]);

  const handleConfirmRestoreItem = useCallback(() => {
    if (!restoreSelectedItemId) return;
    restoreItemMutation.mutate(restoreSelectedItemId, {
      onSuccess: (data) => {
        setIsRestoreConfirmOpen(false);
        setRestoreSelectedItemId(null);
        showToast.success(T.toast.itemRestored, data.message);
      },
    });
  }, [restoreItemMutation, restoreSelectedItemId, setIsRestoreConfirmOpen, setRestoreSelectedItemId]);

  const handleConfirmDeleteItem = useCallback(() => {
    if (!deleteSelectedId) return;
    deleteItemMutation.mutate(deleteSelectedId, {
      onSuccess: (data) => {
        setIsDeleteItemConfirmOpen(false);
        setDeleteSelectedId(null);
        showToast.success(T.toast.itemDeleted, data.message);
      },
    });
  }, [deleteItemMutation, deleteSelectedId, setIsDeleteItemConfirmOpen, setDeleteSelectedId]);

  const handleConfirmRestoreUser = useCallback(() => {
    if (!userRestoreSelectedId) return;
    restoreUserMutation.mutateAsync(userRestoreSelectedId, {
      onSuccess: (data) => {
        setIsUserRestoreConfirmOpen(false);
        setUserRestoreSelectedId(null);
        showToast.success(T.toast.userRestored, data.message);
      },
    });
  }, [restoreUserMutation, userRestoreSelectedId, setIsUserRestoreConfirmOpen, setUserRestoreSelectedId]);

  const handleConfirmDeleteUser = useCallback(() => {
    if (!userDeleteSelectedId) return;
    deleteUserMutation.mutateAsync(userDeleteSelectedId, {
      onSuccess: (data) => {
        setIsUserDeleteConfirmOpen(false);
        setUserDeleteSelectedId(null);
        showToast.success(T.toast.userDeleted, data.message);
      },
    });
  }, [deleteUserMutation, userDeleteSelectedId, setIsUserDeleteConfirmOpen, setUserDeleteSelectedId]);

  // Handler helpers
  const viewArchiveItemCredentials = (id: string) => { setSelectedItemId(id); setIsItemDetailsOpen(true); };
  const viewArchiveTeacherCredentials = (id: string) => { setSelectedTeacherId(id); setIsTeacherCredentialsOpen(true); };
  const handleCloseArchiveTeacherCredentials = () => { setSelectedTeacherId(null); setIsTeacherCredentialsOpen(false); };
  const handleArchiveStudentCredentials = (id: string) => { setSelectedStudentId(id); setIsStudentCredentialsOpen(true); };
  const handleCloseStudentCredentials = () => { setSelectedStudentId(null); setIsStudentCredentialsOpen(false); };
  const handleRestoreItem = (id: string) => { setRestoreSelectedItemId(id); setIsRestoreConfirmOpen(true); };
  const handleCancelRestore = () => { setIsRestoreConfirmOpen(false); setRestoreSelectedItemId(null); };
  const handleDeleteItem = (id: string) => { setDeleteSelectedId(id); setIsDeleteItemConfirmOpen(true); };
  const handleCancelDeleteItem = () => { setIsDeleteItemConfirmOpen(false); setDeleteSelectedId(null); };
  const handleRestoreUser = (id: string) => { setUserRestoreSelectedId(id); setIsUserRestoreConfirmOpen(true); };
  const handleCancelUserRestore = () => { setIsUserRestoreConfirmOpen(false); setUserRestoreSelectedId(null); };
  const handleDeleteUser = (id: string) => { setUserDeleteSelectedId(id); setIsUserDeleteConfirmOpen(true); };
  const handleCancelUserDelete = () => { setIsUserDeleteConfirmOpen(false); setUserDeleteSelectedId(null); };

  const handleTabChange = (key: FilterKey) => {
    setActiveFilter(key);
    setCurrentPage(1);
    setSearchItem("");
    setSelectedCategory("");
  };

  const activeTab = filterTabs.find((t) => t.key === activeFilter) ?? filterTabs[0];
  const activeLabel = activeTab.label.toLowerCase();
  const isEmpty = tabCounts[activeFilter] === 0;
  const hasError = isError || isUsersError;

  if (isPending || isUsersPending) return <ArchiveSkeletonLoader />;

  const renderEmptyRow = (colSpan: number) => (
    <tr>
      <td colSpan={colSpan}>
        <EmptyState icon={activeTab.icon} label={activeLabel} isEmpty={isEmpty} />
      </td>
    </tr>
  );

  const renderHead = (headers: readonly string[]) => (
    <thead>
      <tr className="sticky top-0 z-10 bg-slate-50">
        {headers.map((h) => (
          <th key={h} className={thClass}>{h}</th>
        ))}
        <th className={`${thClass} w-16`} />
      </tr>
    </thead>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8">

        {/* Header */}
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{T.description}</p>
        </header>

        {/* Stats — doubles as the tab switcher */}
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
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
              <p className="text-sm text-slate-500">{T.table.count(activeCount, activeLabel)}</p>
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
                  {/* Items */}
                  {activeFilter === "items" && (
                    <>
                      {renderHead(T.headers.items)}
                      <tbody className="divide-y divide-slate-100">
                        {paginatedItems.length === 0
                          ? renderEmptyRow(T.headers.items.length + 1)
                          : paginatedItems.map((item) => (
                            <tr
                              key={item.id}
                              onClick={() => viewArchiveItemCredentials(item.id)}
                              className="cursor-pointer transition-colors hover:bg-slate-50"
                            >
                              <ArchiveItemTable
                                id={item.id}
                                archivedAt={item.createdAt}
                                itemName={item.itemName}
                                serialNumber={item.serialNumber}
                                image={item.image || no_image_svg}
                                description={item.description}
                                category={item.category}
                                condition={item.condition}
                                onRestore={handleRestoreItem}
                                onDelete={handleDeleteItem}
                                isRestoring={restoreItemMutation.isPending}
                                isDeleting={deleteItemMutation.isPending}
                              />
                            </tr>
                          ))}
                      </tbody>
                    </>
                  )}

                  {/* Admin & staff */}
                  {activeFilter === "users" && (
                    <>
                      {renderHead(T.headers.users)}
                      <tbody className="divide-y divide-slate-100">
                        {paginatedUsers.length === 0
                          ? renderEmptyRow(T.headers.users.length + 1)
                          : paginatedUsers.map((user: TNewUserTypes) => (
                            <tr key={user.id} className="transition-colors hover:bg-slate-50">
                              <td className="px-5 py-3">
                                <UserIdentity
                                  firstName={user.firstName}
                                  middleName={user.middleName}
                                  lastName={user.lastName}
                                  subtitle={user.id}
                                />
                              </td>
                              <td className="px-5 py-3 text-slate-700">{user.username}</td>
                              <td className="px-5 py-3 text-slate-600">{user.email}</td>
                              <td className="px-5 py-3 text-slate-600 tabular-nums">{user.phoneNumber}</td>
                              <td className="px-5 py-3"><RoleBadge role={user.userRole} /></td>
                              <td className="px-5 py-3"><StatusBadge status={user.status} /></td>
                              <td className="px-5 py-3 text-right">
                                <ArchiveRowActions
                                  restoreLabel={T.rowActions.restoreUser}
                                  deleteLabel={T.rowActions.deleteUser}
                                  onRestore={() => handleRestoreUser(user.id)}
                                  onDelete={() => handleDeleteUser(user.id)}
                                  isRestoring={restoreUserMutation.isPending}
                                  isDeleting={deleteUserMutation.isPending}
                                />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </>
                  )}

                  {/* Teachers */}
                  {activeFilter === "teachers" && (
                    <>
                      {renderHead(T.headers.teachers)}
                      <tbody className="divide-y divide-slate-100">
                        {paginatedUsers.length === 0
                          ? renderEmptyRow(T.headers.teachers.length + 1)
                          : paginatedUsers.map((user: TNewUserTypes) => (
                            <tr
                              key={user.id}
                              onClick={() => viewArchiveTeacherCredentials(user.id)}
                              className="cursor-pointer transition-colors hover:bg-slate-50"
                            >
                              <ArchiveTeacherTable
                                id={user.id}
                                firstName={user.firstName}
                                middleName={user.middleName}
                                lastName={user.lastName}
                                username={user.username}
                                status={user.status}
                                onDelete={handleDeleteUser}
                                onRestore={handleRestoreUser}
                                isRestoring={restoreUserMutation.isPending}
                                isDeleting={deleteUserMutation.isPending}
                              />
                            </tr>
                          ))}
                      </tbody>
                    </>
                  )}

                  {/* Students */}
                  {activeFilter === "students" && (
                    <>
                      {renderHead(T.headers.students)}
                      <tbody className="divide-y divide-slate-100">
                        {paginatedUsers.length === 0
                          ? renderEmptyRow(T.headers.students.length + 1)
                          : paginatedUsers.map((user: TStudentTypes) => (
                            <tr
                              key={user.id}
                              onClick={() => handleArchiveStudentCredentials(user.id)}
                              className="cursor-pointer transition-colors hover:bg-slate-50"
                            >
                              <ArchiveStudentTable
                                id={user.id}
                                firstName={user.firstName}
                                middleName={user.middleName}
                                lastName={user.lastName}
                                course={user.course}
                                section={user.section}
                                year={user.year}
                                status={user.status}
                                onDelete={handleDeleteUser}
                                onRestore={handleRestoreUser}
                                isRestoring={restoreUserMutation.isPending}
                                isDeleting={deleteUserMutation.isPending}
                              />
                            </tr>
                          ))}
                      </tbody>
                    </>
                  )}
                </table>
              )}
            </div>
          </div>

          {/* Pagination footer */}
          {!hasError && activeCount > 0 && (
            <Pagination
              totalPages={totalPages}
              currentPage={validCurrentPage}
              totalItems={activeCount}
              itemsPerPage={itemsPerPage}
              handlePageChange={handlePageChange}
            />
          )}
        </section>
      </div>

      {/* Modals */}
      {isRestoreConfirmOpen && (
        <PopUpModal {...T.modals.restoreItem}
          onHandleCancelAction={handleCancelRestore} onHandleConfirmAction={handleConfirmRestoreItem}
          isLoading={restoreItemMutation.isPending} />
      )}
      {isDeleteConfirmOpen && (
        <PopUpModalDelete {...T.modals.deleteItem}
          onHandleCancelAction={handleCancelDeleteItem} onHandleConfirmAction={handleConfirmDeleteItem} />
      )}
      {isUserRestoreConfirmOpen && (
        <PopUpModal {...T.modals.restoreUser}
          onHandleCancelAction={handleCancelUserRestore} onHandleConfirmAction={handleConfirmRestoreUser}
          isLoading={restoreUserMutation.isPending} />
      )}
      {isUserDeleteConfirmOpen && (
        <PopUpModalDelete {...T.modals.deleteUser}
          onHandleCancelAction={handleCancelUserDelete} onHandleConfirmAction={handleConfirmDeleteUser} />
      )}
      {isStudentCredentialsOpen && selectedStudentId && (
        <ArchiveStudentCredentialsPopup studentId={selectedStudentId} isOpen={isStudentCredentialsOpen} onClose={handleCloseStudentCredentials} />
      )}
      {isTeacherCredentialsOpen && selectedTeacherId && (
        <ArchiveTeacherCredentialsPopup teacherId={selectedTeacherId} isOpen={isTeacherCredentialsOpen} onClose={handleCloseArchiveTeacherCredentials} />
      )}
      {isItemDetailsOpen && selectedItemId && (
        <ArchiveItemDetailsPopup itemId={selectedItemId} isOpen={isItemDetailsOpen}
          onClose={() => { setIsItemDetailsOpen(false); setSelectedItemId(null); }} />
      )}
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
