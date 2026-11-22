import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { showToast } from "../../../components/AppToast";
import { type FilterGroup } from "../../../components/SelectItemFilters";
import { allAssetsApi } from "../../../api/asset_api";
import { useAllRooms, useAssetCount, useAssetPage, useFilteredAssets, useGetCategories, useImportAssets } from "../../../hooks/assetHooks";
import { activeFilterCount, applyClientFilters, listMode, pageOf, serverParams, sortAssets } from "../../../lib/assetFilters";
import { formatEnum } from "../../../lib/utils";
import { UserData, canManageAssets } from "../../../utils/usersData/userData";
import type { AssetCondition, AssetStatus, AssetType } from "../../../@types/types";
import { useInventoryListState } from "../../../states/inventory-list-state";
import { INVENTORY_LIST_CONTENT as T } from "../../../constants/inventoryListContent";
import { AlertTriangle, CheckCircle2, Package, Truck } from "lucide-react";

export const PAGE_SIZE = 10;
export const SEARCH_DEBOUNCE_MS = 300;

export const ASSET_STATUSES: AssetStatus[] = [
  "IN_STORAGE", "AT_COUNTER", "IN_TRANSIT", "IN_ROOM_VERIFIED",
  "LOCATION_ANOMALY", "OVERDUE", "MISSING", "MAINTENANCE", "RETIRED",
];
export const ASSET_CONDITIONS: AssetCondition[] = ["GOOD", "FAIR", "DAMAGED"];
export const ASSET_TYPES: AssetType[] = ["BORROWABLE", "FIXED"];

export const OUT_STATUSES: AssetStatus[] = ["AT_COUNTER", "IN_TRANSIT", "IN_ROOM_VERIFIED"];
export const ATTENTION_STATUSES: AssetStatus[] = ["LOCATION_ANOMALY", "OVERDUE", "MISSING", "MAINTENANCE"];

export const toOptions = (values: string[]) => values.map((value) => ({ value, label: formatEnum(value) }));

export const useInventoryListViewModel = () => {
  const viewer = UserData();
  const canManage = canManageAssets(viewer.role);
  const {
    currentPage,
    setCurrentPage,
    filters,
    setFilter,
    clearFilters,
    isAddItemFormOpen,
    setIsAddItemFormOpen,
    isImporting,
    isExporting,
    setIsImporting,
    setIsExporting,
    isMoreMenuOpen,
    setIsMoreMenuOpen,
  } = useInventoryListState();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // ── Search (debounced, then sent as q) ────────────────────────────────────
  const [searchInput, setSearchInput] = useState(filters.search);
  useEffect(() => {
    const next = searchInput.trim();
    if (next === filters.search) return;
    const timer = setTimeout(() => setFilter("search", next), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, filters.search, setFilter]);

  // ── List query (FR-4.4) ──────────────────────────────────────────────────
  // Only staff who can restore see deleted assets.
  const showDeleted = canManage && filters.showDeleted;
  // Server paging for the filters GET /assets knows; otherwise fetch the matches and finish here (lib/assetFilters).
  const mode = listMode(filters);
  const listFilters = serverParams(filters, showDeleted);
  const serverPage = useQuery({
    ...useAssetPage({ ...listFilters, page: currentPage, pageSize: PAGE_SIZE }),
    enabled: mode === "server",
  });
  const allMatches = useQuery(useFilteredAssets(listFilters, mode === "client"));
  const clientMatches = useMemo(
    () => (allMatches.data ? sortAssets(applyClientFilters(allMatches.data, filters), filters.sort) : undefined),
    [allMatches.data, filters],
  );
  const pageQuery = mode === "server" ? serverPage : allMatches;
  const page = mode === "server" ? serverPage.data : clientMatches && pageOf(clientMatches, currentPage, PAGE_SIZE);
  // includeDeleted adds deleted rows to the list (marked, with Restore).
  const [hasShownList, setHasShownList] = useState(false);
  if (page && !hasShownList) setHasShownList(true);
  const rows = page?.items ?? [];
  const total = page?.total ?? 0;
  const totalPages = page?.totalPages ?? 1;

  // A delete or a narrower filter can leave us past the last page.
  useEffect(() => {
    if (page && currentPage > page.totalPages) setCurrentPage(page.totalPages);
  }, [page, currentPage, setCurrentPage]);

  const { data: categories = [] } = useQuery(useGetCategories());
  const { data: roomsData } = useQuery(useAllRooms());
  const rooms = useMemo(
    () => (Array.isArray(roomsData) ? [...roomsData].sort((a, b) => a.code.localeCompare(b.code)) : []),
    [roomsData],
  );

  // ── Summary cards (counts across all assets, ignoring filters) ─────────────
  const totalCount = useQuery(useAssetCount());
  const inStorageCount = useQuery(useAssetCount({ status: "IN_STORAGE" }));
  const outCount = useQuery(useAssetCount({ status: OUT_STATUSES }));
  const attentionCount = useQuery(useAssetCount({ status: ATTENTION_STATUSES }));
  const stats = [
    { label: T.stats.total, value: totalCount.data, icon: Package },
    { label: T.stats.inStorage, value: inStorageCount.data, icon: CheckCircle2 },
    { label: T.stats.out, value: outCount.data, icon: Truck },
    { label: T.stats.needsAttention, value: attentionCount.data, icon: AlertTriangle, hint: T.stats.needsAttentionHint },
  ];

  const filterGroups: FilterGroup[] = [
    {
      key: "status",
      label: T.filters.status,
      options: toOptions(ASSET_STATUSES),
      selected: filters.status,
      onChange: (value) => setFilter("status", value as AssetStatus | ""),
    },
    {
      key: "condition",
      label: T.filters.condition,
      options: toOptions(ASSET_CONDITIONS),
      selected: filters.condition,
      onChange: (value) => setFilter("condition", value as AssetCondition | ""),
    },
    {
      key: "type",
      label: T.filters.type,
      options: toOptions(ASSET_TYPES),
      selected: filters.type,
      onChange: (value) => setFilter("type", value as AssetType | ""),
    },
  ];

  const hasNarrowingFilters = activeFilterCount(filters) > 0;
  const hasAnyFilter = hasNarrowingFilters || !!filters.search;

  const clearAll = () => {
    clearFilters();
    setFilter("search", "");
    setSearchInput("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) setIsMoreMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsMoreMenuOpen]);

  // ── Import / export ──────────────────────────────────────────────────────
  const { mutate: importItem } = useImportAssets();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reset = () => {
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const validTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(file.type)) {
      showToast.error(T.toast.invalidFileTitle, T.toast.invalidFile);
      return reset();
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast.error(T.toast.fileTooLargeTitle, T.toast.fileTooLarge);
      return reset();
    }

    setIsImporting(true);
    const form = new FormData();
    form.append("file", file);
    importItem(form, {
      onSuccess: () => showToast.success(T.toast.importSuccessTitle, T.toast.importSuccess),
      onError: (error) => {
        console.error(error.message);
        showToast.error(T.toast.importFailedTitle, T.toast.importFailed);
      },
      onSettled: () => setIsImporting(false),
    });
    reset();
  };

  // Exports every asset matching the current filters, not just this page.
  const handleExportItems = async () => {
    if (total === 0) {
      showToast.warning(T.toast.nothingToExportTitle, T.toast.nothingToExport);
      return;
    }

    setIsExporting(true);
    try {
      // Client mode already holds every match; server mode fetches them with the same filters.
      const assets = mode === "client" && clientMatches ? clientMatches : await allAssetsApi(listFilters);
      const exportData = assets.map((item) => ({
        AssetCode: item.assetCode,
        Name: item.name,
        Category: item.category?.name ?? "",
        Type: item.type,
        Brand: item.brand ?? "",
        Model: item.model ?? "",
        SerialNo: item.serialNo ?? "",
        RfidTagUid: item.rfidTagUid ?? "",
        Condition: item.condition,
        Status: item.status,
        ReplacementCost: item.replacementCost,
        AcquiredAt: item.acquiredAt ?? "",
        Notes: item.notes ?? "",
        DeletedAt: item.deletedAt ?? "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      worksheet["!cols"] = [
        { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 16 }, { wch: 10 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 30 }, { wch: 22 },
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, T.exportSheetName);

      const filename = `assets_export_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);
      showToast.success(T.toast.exportSuccessTitle, T.toast.exportSuccess(exportData.length, filename));
    } catch (error) {
      console.error("Export error:", error);
      showToast.error(T.toast.exportFailedTitle, error instanceof Error ? error.message : T.toast.unknownError);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    viewer,
    canManage,
    currentPage,
    setCurrentPage,
    filters,
    setFilter,
    clearFilters,
    isAddItemFormOpen,
    setIsAddItemFormOpen,
    isImporting,
    isExporting,
    setIsImporting,
    setIsExporting,
    isMoreMenuOpen,
    setIsMoreMenuOpen,
    fileInputRef,
    moreMenuRef,
    searchInput,
    setSearchInput,
    showDeleted,
    mode,
    listFilters,
    serverPage,
    allMatches,
    clientMatches,
    pageQuery,
    page,
    hasShownList,
    setHasShownList,
    rows,
    total,
    totalPages,
    categories,
    roomsData,
    rooms,
    totalCount,
    inStorageCount,
    outCount,
    attentionCount,
    stats,
    filterGroups,
    hasNarrowingFilters,
    hasAnyFilter,
    clearAll,
    importItem,
    handleFileChange,
    handleExportItems,
  };
};

export type InventoryListViewModel = ReturnType<typeof useInventoryListViewModel>;
