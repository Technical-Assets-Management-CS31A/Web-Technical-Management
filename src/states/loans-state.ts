import { create } from "zustand";
import type { LoanSortOrder } from "../lib/loanFilters";

// Screen state for the Loans list. Status and room live in the URL (?status=&roomId=) so links can deep-link a filter.

interface ILoansState {
  searchTerm: string;
  setSearchTerm: (value: string) => void;

  currentPage: number;
  setCurrentPage: (value: number) => void;

  sortOrder: LoanSortOrder;
  setSortOrder: (value: LoanSortOrder) => void;

  selectedLoanId: string | null;
  setSelectedLoanId: (id: string | null) => void;
}

const INITIAL = { searchTerm: "", currentPage: 1, sortOrder: "newest" as LoanSortOrder, selectedLoanId: null };

const loansStore = create<ILoansState>((set) => ({
  searchTerm: "",
  setSearchTerm: (value) => set({ searchTerm: value, currentPage: 1 }),

  currentPage: 1,
  setCurrentPage: (value) => set({ currentPage: value }),

  sortOrder: "newest",
  setSortOrder: (value) => set({ sortOrder: value, currentPage: 1 }),

  selectedLoanId: null,
  setSelectedLoanId: (id) => set({ selectedLoanId: id }),
}));

/** Called on login and logout so one account never sees another's open loan or search. */
export const resetLoansState = () => loansStore.setState(INITIAL);

export const useLoansState = () => ({
  searchTerm: loansStore((s) => s.searchTerm),
  setSearchTerm: loansStore((s) => s.setSearchTerm),
  currentPage: loansStore((s) => s.currentPage),
  setCurrentPage: loansStore((s) => s.setCurrentPage),
  sortOrder: loansStore((s) => s.sortOrder),
  setSortOrder: loansStore((s) => s.setSortOrder),
  selectedLoanId: loansStore((s) => s.selectedLoanId),
  setSelectedLoanId: loansStore((s) => s.setSelectedLoanId),
});
