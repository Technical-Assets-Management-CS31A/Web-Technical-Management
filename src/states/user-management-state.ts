import { create } from "zustand";

type TPageTab = "accounts" | "students";

interface IUserManagement {
  activeTab: TPageTab;
  setActiveTab: (value: TPageTab) => void;
  isAddUserOpen: boolean;
  setIsAddUserOpen: (value: boolean) => void;
  isEditUserOpen: boolean;
  setIsEditUserOpen: (value: boolean) => void;
  isViewCredentialsOpen: boolean;
  setIsViewCredentialsOpen: (value: boolean) => void;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (value: boolean) => void;
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
  deleteUserId: string;
  setDeleteUserId: (id: string) => void;
}

const UserManagementStore = create<IUserManagement>((set) => ({
  activeTab: "accounts",
  setActiveTab: (value) => set(() => ({ activeTab: value })),

  isAddUserOpen: false,
  setIsAddUserOpen: (value) => set(() => ({ isAddUserOpen: value })),

  isEditUserOpen: false,
  setIsEditUserOpen: (value) => set(() => ({ isEditUserOpen: value })),

  isViewCredentialsOpen: false,
  setIsViewCredentialsOpen: (value) => set(() => ({ isViewCredentialsOpen: value })),

  isDeleteModalOpen: false,
  setIsDeleteModalOpen: (value) => set(() => ({ isDeleteModalOpen: value })),

  selectedUserId: "",
  setSelectedUserId: (id) => set(() => ({ selectedUserId: id })),

  deleteUserId: "",
  setDeleteUserId: (id) => set(() => ({ deleteUserId: id })),
}));

export const useAllUsersManagementState = () => {
  const activeTab = UserManagementStore((state) => state.activeTab);
  const setActiveTab = UserManagementStore((state) => state.setActiveTab);

  const isAddUserOpen = UserManagementStore((state) => state.isAddUserOpen);
  const setIsAddUserOpen = UserManagementStore((state) => state.setIsAddUserOpen);

  const isEditUserOpen = UserManagementStore((state) => state.isEditUserOpen);
  const setIsEditUserOpen = UserManagementStore((state) => state.setIsEditUserOpen);

  const isViewCredentialsOpen = UserManagementStore((state) => state.isViewCredentialsOpen);
  const setIsViewCredentialsOpen = UserManagementStore((state) => state.setIsViewCredentialsOpen);

  const isDeleteModalOpen = UserManagementStore((state) => state.isDeleteModalOpen);
  const setIsDeleteModalOpen = UserManagementStore((state) => state.setIsDeleteModalOpen);

  const selectedUserId = UserManagementStore((state) => state.selectedUserId);
  const setSelectedUserId = UserManagementStore((state) => state.setSelectedUserId);

  const deleteUserId = UserManagementStore((state) => state.deleteUserId);
  const setDeleteUserId = UserManagementStore((state) => state.setDeleteUserId);

  return {
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
  };
};
