import {
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import AddItemForm from "../components/AddItem";
import SearchBar from "../components/SearchBar";
import InventoryListSkeletonLoader from "../loader/InventoryListSkeletonLoader";
import no_image_svg from "../assets/no-image-svgrepo-com.svg";
import Pagination from "../components/Pagination";
import ErrorTable from "../components/ErrorTables";
import { showToast } from "../components/AppToast";
import * as XLSX from "xlsx";
import { useImportItem } from "../hooks/itemHooks";
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
  PackageOpen,
  Plus,
  Upload,
  Download,
  X,
} from "lucide-react";

export default function InventoryList() {
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
  } = useFilteredItems();

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
    showPrintBarcodeModal,
    setShowPrintBarcodeModal,
    printCurrentPage,
    setPrintCurrentPage,
  } = useInventoryListState();

  const itemsPerPage = 10;
  const itemsPerPrintPage = 15;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const statusCounts = useMemo(() => ({
    all: items.length,
    available: items.filter((item) => item.status.toLowerCase() === "available").length,
    borrowed: items.filter((item) => item.status.toLowerCase() === "borrowed").length,
  }), [items]);

  const conditionCounts = useMemo(() => ({
    New: items.filter((item) => item.condition === "New").length,
    Good: items.filter((item) => item.condition === "Good").length,
    Defective: items.filter((item) => item.condition === "Defective").length,
    Refurbished: items.filter((item) => item.condition === "Refurbished").length,
    NeedRepair: items.filter((item) => item.condition === "NeedRepair").length,
  }), [items]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => counts.set(item.category, (counts.get(item.category) ?? 0) + 1));
    return [...counts.entries()].map(([name, total]) => ({ name, total }));
  }, [items]);

  const stats = [
    { label: T.stats.total, value: statusCounts.all, icon: Package },
    { label: T.stats.available, value: statusCounts.available, icon: CheckCircle2 },
    { label: T.stats.borrowed, value: statusCounts.borrowed, icon: PackageOpen },
    {
      label: T.stats.needsAttention,
      value: conditionCounts.Defective + conditionCounts.NeedRepair,
      icon: AlertTriangle,
      hint: T.stats.needsAttentionHint,
    },
  ];

  const { mutate: importItem } = useImportItem();
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
    if (showPrintBarcodeModal && items) {
      const maxPage = Math.ceil(filteredItems.length / itemsPerPrintPage);
      if (printCurrentPage > maxPage && maxPage > 0) setPrintCurrentPage(1);
    }
  }, [items, showPrintBarcodeModal, filteredItems.length, printCurrentPage, itemsPerPrintPage]);

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

    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result;
      if (!arrayBuffer) return;
      const data = new Uint8Array(arrayBuffer as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      XLSX.utils.sheet_to_json(worksheet);
    };
    reader.readAsArrayBuffer(file);

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
        SerialNumber: item.serialNumber,
        ItemName: item.itemName,
        ItemType: item.itemType,
        ItemMake: item.itemMake,
        ItemModel: item.itemModel || "",
        Description: item.description || "",
        Category: item.category,
        Condition: item.condition,
        Image: "",
        CreatedDate: new Date(item.createdAt).toLocaleDateString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      worksheet["!cols"] = [
        { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, T.exportSheetName);

      const date = new Date().toISOString().split("T")[0];
      const filename = `inventory_export_${date}.xlsx`;
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
        accept=".xlsx,.xls"
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
            <button
              type="button"
              onClick={() => setIsAddItemFormOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              <Plus className="h-4 w-4" />
              {T.newItem}
            </button>

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
                  {selectedCategory && T.table.inCategory(selectedCategory)}
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
                  statusCounts={statusCounts}
                  conditionCounts={conditionCounts}
                />
              </div>
            </div>

            {/* Category chips */}
            {categories.length > 0 && (
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 scrollbar-none">
                {[{ name: "", total: items.length }, ...categories].map((category) => {
                  const isSelected = selectedCategory === category.name;
                  return (
                    <button
                      key={category.name || "all"}
                      type="button"
                      onClick={() => {
                        if (category.name) {
                          handleCategoryClick(category.name);
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
        <AddItemForm onClose={() => setIsAddItemFormOpen(false)} />
      )}

      {showPrintBarcodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{T.printModal.title}</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {T.printModal.readyToExport(filteredItems.length)}
                </p>
              </div>
              <button
                onClick={() => { setShowPrintBarcodeModal(false); setPrintCurrentPage(1); }}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview area */}
            <div className="flex-1 overflow-auto p-6 bg-slate-50/60">
              <div
                id="barcode-print-area"
                className="bg-white p-6 mx-auto max-w-[210mm] min-h-[297mm] rounded-lg border border-slate-200"
              >
                <div className="grid grid-cols-3 gap-3">
                  {filteredItems
                    .slice(
                      (printCurrentPage - 1) * itemsPerPrintPage,
                      printCurrentPage * itemsPerPrintPage,
                    )
                    .map((item) => (
                      <div
                        key={item.id}
                        className="border border-slate-200 rounded-lg p-3 flex flex-col items-center text-center bg-white"
                      >
                        <div className="text-[11px] font-semibold text-slate-800 mb-1.5 line-clamp-2 w-full h-8 flex items-center justify-center">
                          {item.itemName}
                        </div>
                        <div className="w-full flex items-center justify-center">
                          <img
                            src={item.image || no_image_svg}
                            alt={item.serialNumber}
                            className="max-w-full h-16 object-contain"
                          />
                        </div>
                        <div className="text-[9px] text-slate-600 mt-1.5 font-medium font-mono">
                          {item.serialNumber}
                        </div>
                        <div className="text-[8px] text-slate-400 mt-0.5">
                          {item.category}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              {/* Print page pagination */}
              <div>
                {Math.ceil(filteredItems.length / itemsPerPrintPage) > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPrintCurrentPage(Math.max(1, printCurrentPage - 1))}
                      disabled={printCurrentPage === 1}
                      className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {T.printModal.previous}
                    </button>
                    <span className="text-xs text-slate-500 font-medium px-1">
                      {T.printModal.pageOf(printCurrentPage, Math.ceil(filteredItems.length / itemsPerPrintPage))}
                    </span>
                    <button
                      onClick={() => setPrintCurrentPage(Math.min(Math.ceil(filteredItems.length / itemsPerPrintPage), printCurrentPage + 1))}
                      disabled={printCurrentPage === Math.ceil(filteredItems.length / itemsPerPrintPage)}
                      className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {T.printModal.next}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setShowPrintBarcodeModal(false); setPrintCurrentPage(1); }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {T.printModal.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
