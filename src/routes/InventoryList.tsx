import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import AssetFormDialog from "../components/AssetFormDialog";
import SearchBar from "../components/SearchBar";
import InventoryListSkeletonLoader from "../loader/InventoryListSkeletonLoader";
import Pagination from "../components/Pagination";
import { getErrorMessage } from "../components/form/FormKit";
import { showToast } from "../components/AppToast";
import SelectItemFilters, { type FilterGroup } from "../components/SelectItemFilters";
import { InventoryTable } from "../components/InventoryTable";
import { ShowDeletedToggle } from "../components/DeletedRecords";
import { allAssetsApi } from "../api/asset_api";
import { useAssetCount, useAssetPage, useGetCategories, useImportAssets } from "../hooks/assetHooks";
import { formatEnum } from "../lib/utils";
import { UserData, canManageAssets } from "../utils/usersData/userData";
import type { AssetCondition, AssetListParams, AssetStatus, AssetType } from "../@types/types";
import { useInventoryListState, type AssetSort } from "../states/inventory-list-state";
import { INVENTORY_LIST_CONTENT as T } from "../constants/inventoryListContent";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  MoreHorizontal,
  Package,
  Plus,
  Truck,
  Upload,
} from "lucide-react";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const ASSET_STATUSES: AssetStatus[] = [
  "IN_STORAGE", "AT_COUNTER", "IN_TRANSIT", "IN_ROOM_VERIFIED",
  "LOCATION_ANOMALY", "OVERDUE", "MISSING", "MAINTENANCE", "RETIRED",
];
const ASSET_CONDITIONS: AssetCondition[] = ["GOOD", "FAIR", "DAMAGED"];
const ASSET_TYPES: AssetType[] = ["BORROWABLE", "FIXED"];

const OUT_STATUSES: AssetStatus[] = ["AT_COUNTER", "IN_TRANSIT", "IN_ROOM_VERIFIED"];
const ATTENTION_STATUSES: AssetStatus[] = ["LOCATION_ANOMALY", "OVERDUE", "MISSING", "MAINTENANCE"];

const toOptions = (values: string[]) => values.map((value) => ({ value, label: formatEnum(value) }));

export default function InventoryList() {
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

  // ── Server query ─────────────────────────────────────────────────────────
  // Only staff who can restore see deleted assets.
  const showDeleted = canManage && filters.showDeleted;
  const listFilters: Omit<AssetListParams, "page" | "pageSize"> = {
    q: filters.search || undefined,
    categoryId: filters.categoryId || undefined,
    status: filters.status || undefined,
    condition: filters.condition || undefined,
    type: filters.type || undefined,
    includeDeleted: showDeleted || undefined,
    sort: filters.sort,
  };
  const pageQuery = useQuery(useAssetPage({ ...listFilters, page: currentPage, pageSize: PAGE_SIZE }));
  const page = pageQuery.data;
  // includeDeleted adds deleted rows to the list (marked, with Restore); paging stays server-side.
  const rows = page?.items ?? [];
  const total = page?.total ?? 0;
  const totalPages = page?.totalPages ?? 1;

  // A delete or a narrower filter can leave us past the last page.
  useEffect(() => {
    if (page && currentPage > page.totalPages) setCurrentPage(page.totalPages);
  }, [page, currentPage, setCurrentPage]);

  const { data: categories = [] } = useQuery(useGetCategories());

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

  const hasNarrowingFilters = !!(filters.categoryId || filters.status || filters.condition || filters.type);
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
      const assets = await allAssetsApi(listFilters);
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

  if (pageQuery.isPending) return <InventoryListSkeletonLoader />;

  const isRefreshing = pageQuery.isFetching && pageQuery.isPlaceholderData;
  const selectedCategoryName = categories.find((c) => c.id === filters.categoryId)?.name;

  return (
    <div className="min-h-screen bg-slate-50">
      <input type="file" accept=".csv,.xlsx,.xls" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8">

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{T.description}</p>
          </div>

          <div className="flex items-center gap-2">
            {canManage && (
              <button
                type="button"
                onClick={() => setIsAddItemFormOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              >
                <Plus className="h-4 w-4" />
                {T.newItem}
              </button>
            )}

            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                  isMoreMenuOpen ? "border-slate-300 bg-slate-100 text-slate-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
                aria-label={T.moreOptions}
                aria-expanded={isMoreMenuOpen}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => { fileInputRef.current?.click(); setIsMoreMenuOpen(false); }}
                      disabled={isImporting}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isImporting ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <Upload className="h-4 w-4 text-slate-400" />}
                      {isImporting ? T.menu.importing : T.menu.import}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { handleExportItems(); setIsMoreMenuOpen(false); }}
                    disabled={isExporting || total === 0}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <Download className="h-4 w-4 text-slate-400" />}
                    {isExporting ? T.menu.exporting : T.menu.export(total)}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Summary */}
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
              <div className="min-w-0">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
                  {stat.value === undefined ? <span className="text-slate-300">—</span> : stat.value.toLocaleString()}
                </p>
                {stat.hint && <p className="mt-0.5 truncate text-xs text-slate-400">{stat.hint}</p>}
              </div>
              <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 sm:flex">
                <stat.icon className="h-5 w-5" />
              </span>
            </div>
          ))}
        </section>

        {/* Table card */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

          {/* Toolbar */}
          <div className="space-y-4 border-b border-slate-200 px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{T.table.title}</h2>
                <p className="flex items-center gap-2 text-sm text-slate-500" aria-live="polite">
                  <span>
                    {T.table.count(total)}
                    {showDeleted && T.table.includingDeleted}
                    {selectedCategoryName && T.table.inCategory(selectedCategoryName)}
                  </span>
                  {isRefreshing && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Loader2 className="h-3 w-3 animate-spin" /> {T.table.updating}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <SearchBar
                  onChangeValue={setSearchInput}
                  defaultValue={filters.search}
                  name="search"
                  placeholder={T.table.searchPlaceholder}
                />
                <SelectItemFilters groups={filterGroups} onClearAll={clearFilters} />
                <label className="sr-only" htmlFor="asset-sort">{T.sort.label}</label>
                <select
                  id="asset-sort"
                  value={filters.sort}
                  onChange={(e) => setFilter("sort", e.target.value as AssetSort)}
                  className="h-[42px] rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:border-blue-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20"
                >
                  {T.sort.options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {canManage && (
                  <ShowDeletedToggle checked={filters.showDeleted} onChange={(value) => setFilter("showDeleted", value)} />
                )}
              </div>
            </div>

            {/* Category chips (from the categories API) */}
            {categories.length > 0 && (
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 scrollbar-none">
                {[{ id: "", name: T.allCategories }, ...categories].map((category) => {
                  const isSelected = filters.categoryId === category.id;
                  return (
                    <button
                      key={category.id || "all"}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setFilter("categoryId", isSelected && category.id ? "" : category.id)}
                      className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-sm transition-colors ${
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Table body */}
          <div className="overflow-x-auto">
            <div className={`max-h-[60vh] min-h-[50vh] overflow-y-auto transition-opacity ${isRefreshing ? "opacity-60" : ""}`}>
              {pageQuery.isError && !page ? (
                <div role="alert" className="flex flex-col items-center justify-center px-8 py-24 text-center">
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">{T.error.title}</h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">{getErrorMessage(pageQuery.error, T.toast.unknownError)}</p>
                  <button type="button" onClick={() => pageQuery.refetch()} className="mt-4 text-sm font-medium text-blue-600 hover:underline">
                    {T.error.retry}
                  </button>
                </div>
              ) : rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <Package className="h-5 w-5 text-slate-400" />
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {T.empty.title}
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    {T.empty.description}
                  </p>
                  {hasAnyFilter && (
                    <button type="button" onClick={clearAll} className="mt-4 text-sm font-medium text-blue-600 hover:underline">
                      {T.empty.clearFilters}
                    </button>
                  )}
                </div>
              ) : (
                <InventoryTable item={rows} />
              )}
            </div>
          </div>

          <Pagination
            totalPages={totalPages}
            currentPage={Math.min(currentPage, totalPages)}
            totalItems={total}
            itemsPerPage={PAGE_SIZE}
            handlePageChange={setCurrentPage}
          />
        </section>
      </div>

      {isAddItemFormOpen && <AssetFormDialog onClose={() => setIsAddItemFormOpen(false)} />}
    </div>
  );
}
