import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { AssetCondition, AssetStatus, AssetType } from "../@types/types";

// Assets screen state. Filters live here (not in the component) so they survive
// opening an asset and coming back. Changing any filter goes back to page 1.

export type AssetSort = "-createdAt" | "createdAt" | "name" | "assetCode" | "-updatedAt";

export type AssetFilters = {
    search: string
    categoryId: string
    status: AssetStatus | ""
    condition: AssetCondition | ""
    type: AssetType | ""
    showDeleted: boolean
    sort: AssetSort
}

export const DEFAULT_ASSET_FILTERS: AssetFilters = {
    search: "",
    categoryId: "",
    status: "",
    condition: "",
    type: "",
    showDeleted: false,
    sort: "-createdAt",
}

interface IInventoryList {
    currentPage: number
    setCurrentPage: (value: number) => void
    filters: AssetFilters
    setFilter: <K extends keyof AssetFilters>(key: K, value: AssetFilters[K]) => void
    clearFilters: () => void
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
    setCurrentPage: (value) => set(() => ({ currentPage: value })),
    filters: DEFAULT_ASSET_FILTERS,
    setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value }, currentPage: 1 })),
    // Keeps search, sort and the deleted toggle; clears the narrowing filters.
    clearFilters: () => set((state) => ({
        filters: { ...DEFAULT_ASSET_FILTERS, search: state.filters.search, sort: state.filters.sort, showDeleted: state.filters.showDeleted },
        currentPage: 1,
    })),
    isAddItemFormOpen: false,
    setIsAddItemFormOpen: (value) => set(() => ({ isAddItemFormOpen: value })),
    isImporting: false,
    setIsImporting: (value) => set(() => ({ isImporting: value })),
    isExporting: false,
    setIsExporting: (value) => set(() => ({ isExporting: value })),
    isMoreMenuOpen: false,
    setIsMoreMenuOpen: (value) => set(() => ({ isMoreMenuOpen: value })),
}))

export const useInventoryListState = () => inventoryListState(useShallow((state) => state))
