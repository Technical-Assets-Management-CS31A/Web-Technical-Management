import {
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import AssetFormDialog from "../components/AssetFormDialog";
import SearchBar from "../components/SearchBar";
import InventoryListSkeletonLoader from "../loader/InventoryListSkeletonLoader";
import Pagination from "../components/Pagination";
import ErrorTable from "../components/ErrorTables";
import { showToast } from "../components/AppToast";
import * as XLSX from "xlsx";
import { useImportAssets } from "../hooks/assetHooks";
import { formatEnum } from "../lib/utils";
import { UserData, canManageAssets } from "../utils/usersData/userData";
import type { AssetCondition, AssetStatus } from "../@types/types";
import SelectItemFilters from "../components/SelectItemFilters";
import { InventoryTable } from "../components/InventoryTable";
import { useAllInventoryItems, useFilteredItems } from "../data/inventory-data";
import { useInventoryListState } from "../states/inventory-list-state";
import { INVENTORY_LIST_CONTENT as T } from "../constants/inventoryListContent";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MoreHorizontal,
  Package,
  Plus,
  Upload,
  Download,
  Truck,
} from "lucide-react";

const ASSET_STATUSES: AssetStatus[] = [
  "IN_STORAGE", "AT_COUNTER", "IN_TRANSIT", "IN_ROOM_VERIFIED",
  "LOCATION_ANOMALY", "OVERDUE", "MISSING", "MAINTENANCE", "RETIRED",
];
const ASSET_CONDITIONS: AssetCondition[] = ["GOOD", "FAIR", "DAMAGED"];

export default function InventoryList() {
  const viewer = UserData();
  const { items, isPending, isError } = useAllInventoryItems();
  const {
    filteredItems,
    setSearchItem,
    selectedCategory,
    setSelectedCategory,
    selectedCondition,
    setSelectedCondition,
    selectedStatus,
    setSelectedStatus,
  } = useFilteredItems(items);

  const {
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
  } = useInventoryListState();

  const itemsPerPage = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const statusOptions = useMemo(() => [
    { value: "", label: "All Status", count: items.length },
    ...ASSET_STATUSES.map((status) => ({
      value: status,
      label: formatEnum(status),
      count: items.filter((item) => item.status === status).length,
    })),
  ], [items]);

  const conditionOptions = useMemo(() => [
    { value: "", label: "All Conditions", count: items.length },
    ...ASSET_CONDITIONS.map((condition) => ({
      value: condition,
      label: formatEnum(condition),
      count: items.filter((item) => item.condition === condition).length,
    })),
  ], [items]);

  const categories = useMemo(() => {
    const counts = new Map<string, { name: string; total: number }>();
    items.forEach((item) => {
      if (!item.category) return;
      const entry = counts.get(item.category.id) ?? { name: item.category.name, total: 0 };
      counts.set(item.category.id, { ...entry, total: entry.total + 1 });
    });
    return [...counts.entries()].map(([id, { name, total }]) => ({ id, name, total }));
  }, [items]);

  const countOf = (...statuses: AssetStatus[]) => items.filter((item) => statuses.includes(item.status)).length;
  const stats = [
    { label: T.stats.total, value: items.length, icon: Package },
    { label: T.stats.inStorage, value: countOf("IN_STORAGE"), icon: CheckCircle2 },
    { label: T.stats.out, value: countOf("AT_COUNTER", "IN_TRANSIT", "IN_ROOM_VERIFIED"), icon: Truck },
    {
      label: T.stats.needsAttention,
      value: countOf("LOCATION_ANOMALY", "OVERDUE", "MISSING", "MAINTENANCE"),
      icon: AlertTriangle,
      hint: T.stats.needsAttentionHint,
    },
  ];

  const { mutate: importItem } = useImportAssets();
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  const paginatedData = useMemo(
    () => filteredItems.slice(
      (validCurrentPage - 1) * itemsPerPage,
      validCurrentPage * itemsPerPage,
    ),
    [filteredItems, itemsPerPage, validCurrentPage],
  );

  const handlePageChange = useCallback((page: number) => setCurrentPage(page), []);

  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory(selectedCategory === category ? "" : category);
    setCurrentPage(1);
  }, [selectedCategory]);

  const handleShowAll = useCallback(() => {
    setSelectedCategory("");
    setSelectedCondition("");
    setSelectedStatus("");
    setCurrentPage(1);
  }, []);

  const handleConditionChange = useCallback((condition: string) => {
    setSelectedCondition(condition);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(file.type)) {
      showToast.error(T.toast.invalidFileTitle, T.toast.invalidFile);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast.error(T.toast.fileTooLargeTitle, T.toast.fileTooLarge);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsImporting(true);

    const form = new FormData();
    form.append("file", file);

    importItem(form, {
      onSuccess: () => {
        setIsImporting(false);
        showToast.success(T.toast.importSuccessTitle, T.toast.importSuccess);
      },
      onError: (error) => {
        setIsImporting(false);
        console.error(error.message);
        showToast.error(T.toast.importFailedTitle, T.toast.importFailed);
      },
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExportItems = async () => {
    if (filteredItems.length === 0) {
      showToast.warning(T.toast.nothingToExportTitle, T.toast.nothingToExport);
      return;
    }

    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const exportData = filteredItems.map((item) => ({
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
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      worksheet["!cols"] = [
        { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 16 }, { wch: 10 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 30 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, T.exportSheetName);

      const date = new Date().toISOString().split("T")[0];
      const filename = `assets_export_${date}.xlsx`;
      XLSX.writeFile(workbook, filename);

      showToast.success(
        T.toast.exportSuccessTitle,
        T.toast.exportSuccess(exportData.length, filename),
      );
    } catch (error) {
      console.error("Export error:", error);
      showToast.error(
        T.toast.exportFailedTitle,
        error instanceof Error ? error.message : T.toast.unknownError,
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (isPending) return <InventoryListSkeletonLoader />;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hidden file input */}
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8">

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{T.description}</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {canManageAssets(viewer.role) && <button
              type="button"
              onClick={() => setIsAddItemFormOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              <Plus className="h-4 w-4" />
              {T.newItem}
            </button>}

            {/* More menu */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                  isMoreMenuOpen
                    ? "border-slate-300 bg-slate-100 text-slate-700"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
                aria-label={T.moreOptions}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                  {/* Import */}
                  <button
                    onClick={() => { fileInputRef.current?.click(); setIsMoreMenuOpen(false); }}
                    disabled={isImporting}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isImporting
                      ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      : <Upload className="h-4 w-4 text-slate-400" />
                    }
                    {isImporting ? T.menu.importing : T.menu.import}
                  </button>

                  {/* Export */}
                  <button
                    onClick={() => { handleExportItems(); setIsMoreMenuOpen(false); }}
                    disabled={isExporting || filteredItems.length === 0}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isExporting
                      ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      : <Download className="h-4 w-4 text-slate-400" />
                    }
                    {isExporting ? T.menu.exporting : T.menu.export(filteredItems.length)}
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
                  {stat.value.toLocaleString()}
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
                <p className="text-sm text-slate-500">
                  {T.table.count(filteredItems.length)}
                  {selectedCategory && T.table.inCategory(categories.find((c) => c.id === selectedCategory)?.name ?? "")}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <SearchBar
                  onChangeValue={(value) => setSearchItem(value)}
                  name="search"
                  placeholder={T.table.searchPlaceholder}
                />
                <SelectItemFilters
                  onStatusChange={handleStatusChange}
                  onConditionChange={handleConditionChange}
                  selectedStatus={selectedStatus}
                  selectedCondition={selectedCondition}
                  statuses={statusOptions}
                  conditions={conditionOptions}
                />
              </div>
            </div>

            {/* Category chips */}
            {categories.length > 0 && (
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 scrollbar-none">
                {[{ id: "", name: "", total: items.length }, ...categories].map((category) => {
                  const isSelected = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id || "all"}
                      type="button"
                      onClick={() => {
                        if (category.id) {
                          handleCategoryClick(category.id);
                        } else {
                          setSelectedCategory("");
                          setCurrentPage(1);
                        }
                      }}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors ${
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                      }`}
                    >
                      {category.name || T.allCategories}
                      <span className={`text-xs tabular-nums ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                        {category.total}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Table body */}
          <div className="overflow-x-auto">
            <div className="max-h-[60vh] min-h-[50vh] overflow-y-auto">
              {isError ? (
                <ErrorTable />
              ) : paginatedData.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <Package className="h-5 w-5 text-slate-400" />
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">{T.empty.title}</h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">{T.empty.description}</p>
                  {(selectedCategory || selectedStatus || selectedCondition) && (
                    <button
                      onClick={handleShowAll}
                      className="mt-4 text-sm font-medium text-blue-600 hover:underline"
                    >
                      {T.empty.clearFilters}
                    </button>
                  )}
                </div>
              ) : (
                <InventoryTable item={paginatedData} />
              )}
            </div>
          </div>

          {/* Pagination footer */}
          <Pagination
            totalPages={totalPages}
            currentPage={validCurrentPage}
            totalItems={filteredItems.length}
            itemsPerPage={itemsPerPage}
            handlePageChange={handlePageChange}
          />
        </section>
      </div>

      {/* Add item form */}
      {isAddItemFormOpen && (
        <AssetFormDialog onClose={() => setIsAddItemFormOpen(false)} />
      )}

    </div>
  );
}
