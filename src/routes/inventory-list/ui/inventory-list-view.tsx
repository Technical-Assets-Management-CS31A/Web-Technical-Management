import AssetFormDialog from "../../../components/AssetFormDialog";
import SearchBar from "../../../components/SearchBar";
import InventoryListSkeletonLoader from "./inventory-list-skeleton";
import Pagination from "../../../components/Pagination";
import { getErrorMessage } from "../../../components/form/FormKit";
import SelectItemFilters from "../../../components/SelectItemFilters";
import { InventoryTable } from "../../../components/InventoryTable";
import { ShowDeletedToggle } from "../../../components/DeletedRecords";
import { type AssetSort, type RoomScope } from "../../../states/inventory-list-state";
import { INVENTORY_LIST_CONTENT as T } from "../../../constants/inventoryListContent";
import { AlertTriangle, Download, Loader2, MoreHorizontal, Package, Plus, Upload } from "lucide-react";
import { PAGE_SIZE, type InventoryListViewModel } from "../model/inventory-list-view-model";

export default function InventoryListView(vm: InventoryListViewModel) {
  const {
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
    isMoreMenuOpen,
    setIsMoreMenuOpen,
    fileInputRef,
    moreMenuRef,
    setSearchInput,
    showDeleted,
    pageQuery,
    page,
    hasShownList,
    rows,
    total,
    totalPages,
    categories,
    rooms,
    stats,
    filterGroups,
    hasAnyFilter,
    clearAll,
    handleFileChange,
    handleExportItems,
  } = vm;

  // The skeleton is for the first load only. Later loads (e.g. typing a search switches to client mode) keep
  // the toolbar mounted so the search box does not lose focus.
  if (!hasShownList && pageQuery.isPending) return <InventoryListSkeletonLoader />;

  const isRefreshing = pageQuery.isFetching && pageQuery.isPlaceholderData;
  const selectedCategoryName = categories.find((c) => c.id === filters.categoryId)?.name;
  const selectedRoomCode = rooms.find((r) => r.id === filters.roomId)?.code;

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
                    {selectedRoomCode && T.table.inRoom(selectedRoomCode, filters.roomScope)}
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
                <label className="sr-only" htmlFor="asset-room">{T.filters.room}</label>
                <select
                  id="asset-room"
                  value={filters.roomId}
                  onChange={(e) => setFilter("roomId", e.target.value)}
                  className={`h-[42px] max-w-[220px] rounded-lg border bg-white px-3 text-sm hover:border-blue-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 ${
                    filters.roomId ? "border-blue-500 text-blue-700" : "border-slate-300 text-slate-700"
                  }`}
                >
                  <option value="">{T.filters.allRooms}</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>{room.code} — {room.name}</option>
                  ))}
                </select>
                {filters.roomId && (
                  <>
                    <label className="sr-only" htmlFor="asset-room-scope">{T.filters.roomScope}</label>
                    <select
                      id="asset-room-scope"
                      value={filters.roomScope}
                      title={T.filters.roomScopeHint}
                      onChange={(e) => setFilter("roomScope", e.target.value as RoomScope)}
                      className="h-[42px] rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:border-blue-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20"
                    >
                      {T.filters.roomScopes.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </>
                )}
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
              ) : !page ? (
                <div className="flex items-center justify-center gap-2 px-8 py-24 text-sm text-slate-500" aria-busy="true">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> {T.table.updating}
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
