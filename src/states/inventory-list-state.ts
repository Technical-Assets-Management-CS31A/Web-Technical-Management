import { create } from "zustand";

interface IInventoryList {
    currentPage: number
    setCurrentPage: (value: number) => void
    isAddItemFormOpen: boolean
    setIsAddItemFormOpen: (value: boolean) => void
    isImporting: boolean
    setIsImporting: (value: boolean) => void
    isExporting: boolean
    setIsExporting: (value: boolean) => void
    isMoreMenuOpen: boolean
    setIsMoreMenuOpen: (value: boolean) => void
}

const inventoryListState = create<IInventoryList>((set) => ({
    currentPage: 1,
    setCurrentPage: (value) => set(() => ({
        currentPage: value
    })),
    isAddItemFormOpen: false,
    setIsAddItemFormOpen: (value) => set(() => ({
        isAddItemFormOpen: value
    })),
    isImporting: false,
    setIsImporting: (value) => set(() => ({
        isImporting: value
    })),
    isExporting: false,
    setIsExporting: (value) => set(() => ({
        isExporting: value
    })),
    isMoreMenuOpen: false,
    setIsMoreMenuOpen: (value) => set(() => ({
        isMoreMenuOpen: value
    })),
}))

export const useInventoryListState = () => {
    const currentPage = inventoryListState((state) => state.currentPage)
    const setCurrentPage = inventoryListState((state) => state.setCurrentPage)
    const isAddItemFormOpen = inventoryListState((state) => state.isAddItemFormOpen)
    const setIsAddItemFormOpen = inventoryListState((state) => state.setIsAddItemFormOpen)
    const isImporting = inventoryListState((state) => state.isImporting)
    const setIsImporting = inventoryListState((state) => state.setIsImporting)
    const isExporting = inventoryListState((state) => state.isExporting)
    const setIsExporting = inventoryListState((state) => state.setIsExporting)
    const isMoreMenuOpen = inventoryListState((state) => state.isMoreMenuOpen)
    const setIsMoreMenuOpen = inventoryListState((state) => state.setIsMoreMenuOpen)

    return {
        currentPage,
        setCurrentPage,
        isAddItemFormOpen,
        setIsAddItemFormOpen,
        isImporting,
        isExporting,
        setIsImporting,
        setIsExporting,
        isMoreMenuOpen,
        setIsMoreMenuOpen,
    };
};
