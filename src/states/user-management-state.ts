import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { StudentStanding } from "../@types/types";

// People screen state. Roster filters live here so they survive switching tabs
// and opening a student. Changing any roster filter goes back to page 1.

export type PeopleTab = "accounts" | "students" | "sections";

export type RosterFilters = {
  search: string;
  sectionId: string;
  standing: StudentStanding | "";
  /** "" = everyone, "yes" = has a fingerprint, "no" = still to enroll */
  enrolled: "" | "yes" | "no";
  showDeleted: boolean;
};

export const DEFAULT_ROSTER_FILTERS: RosterFilters = {
  search: "",
  sectionId: "",
  standing: "",
  enrolled: "",
  showDeleted: false,
};

interface IUserManagement {
  activeTab: PeopleTab;
  setActiveTab: (value: PeopleTab) => void;

  // Accounts
  showDeletedAccounts: boolean;
  setShowDeletedAccounts: (value: boolean) => void;
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

  // Student roster
  rosterPage: number;
  setRosterPage: (value: number) => void;
  rosterFilters: RosterFilters;
  setRosterFilter: <K extends keyof RosterFilters>(key: K, value: RosterFilters[K]) => void;
  clearRosterFilters: () => void;
}

const UserManagementStore = create<IUserManagement>((set) => ({
  activeTab: "accounts",
  setActiveTab: (value) => set(() => ({ activeTab: value })),

  showDeletedAccounts: false,
  setShowDeletedAccounts: (value) => set(() => ({ showDeletedAccounts: value })),
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

  rosterPage: 1,
  setRosterPage: (value) => set(() => ({ rosterPage: value })),
  rosterFilters: DEFAULT_ROSTER_FILTERS,
  setRosterFilter: (key, value) =>
    set((state) => ({ rosterFilters: { ...state.rosterFilters, [key]: value }, rosterPage: 1 })),
  // Keeps search and the deleted toggle; clears the narrowing filters.
  clearRosterFilters: () =>
    set((state) => ({
      rosterFilters: { ...DEFAULT_ROSTER_FILTERS, search: state.rosterFilters.search, showDeleted: state.rosterFilters.showDeleted },
      rosterPage: 1,
    })),
}));

export const useAllUsersManagementState = () => UserManagementStore(useShallow((state) => state));
