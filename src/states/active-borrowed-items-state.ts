import { create } from "zustand";

interface IActiveBorrowedItemsState {
  searchTerm: string;
  setSearchTerm: (value: string) => void;

  currentPage: number;
  setCurrentPage: (value: number) => void;

  selectedBorrowId: string | null;
  setSelectedBorrowId: (id: string | null) => void;

}

const activeBorrowedItemsStore = create<IActiveBorrowedItemsState>((set) => ({
  searchTerm: "",
  setSearchTerm: (value) => set(() => ({ searchTerm: value })),

  currentPage: 1,
  setCurrentPage: (value) => set(() => ({ currentPage: value })),

  selectedBorrowId: null,
  setSelectedBorrowId: (id) => set(() => ({ selectedBorrowId: id })),

}));

export const useActiveBorrowedItemsState = () => {
  const searchTerm = activeBorrowedItemsStore((state) => state.searchTerm);
  const setSearchTerm = activeBorrowedItemsStore((state) => state.setSearchTerm);

  const currentPage = activeBorrowedItemsStore((state) => state.currentPage);
  const setCurrentPage = activeBorrowedItemsStore((state) => state.setCurrentPage);

  const selectedBorrowId = activeBorrowedItemsStore((state) => state.selectedBorrowId);
  const setSelectedBorrowId = activeBorrowedItemsStore((state) => state.setSelectedBorrowId);


  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    selectedBorrowId,
    setSelectedBorrowId,
  };
};
