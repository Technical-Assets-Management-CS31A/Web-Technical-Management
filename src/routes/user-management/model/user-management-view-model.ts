import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDeleteUser, useRestoreUser, useStudentCount } from "../../../hooks/userHooks";
import { showToast } from "../../../components/AppToast";
import { getErrorMessage } from "../../../components/form/FormKit";
import { useAllUsersManagement, useFilteredUser } from "../../../data/user-management-data";
import { useAllUsersManagementState } from "../../../states/user-management-state";
import { UserData, canManageAccounts } from "../../../utils/usersData/userData";
import { USER_MANAGEMENT_CONTENT as T } from "../../../constants/userManagementContent";
import { Fingerprint, Layers, ShieldAlert, ShieldX, Users, Shield, Snowflake, GraduationCap, Presentation } from "lucide-react";

export const useUserManagementViewModel = () => {
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

  return {
    viewer,
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
    canManage,
    showDeleted,
    mutate,
    isDeleting,
    restoreUser,
    users,
    isPending,
    isError,
    filteredUser,
    setSearchUser,
    setSelectedStatus,
    selectedRole,
    setSelectedRole,
    studentTotal,
    notEnrolled,
    warned,
    blocked,
    selectedUser,
    confirmDeleteUser,
    cancelDeleteUser,
    handleRestoreUser,
    handleViewUserCredentials,
    liveUsers,
    instructors,
    staff,
    frozenCount,
    noCardCount,
    activeCount,
    accountStats,
    studentStats,
    stats,
    tabs,
  };
};

export type UserManagementViewModel = ReturnType<typeof useUserManagementViewModel>;
