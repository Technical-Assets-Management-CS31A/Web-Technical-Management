import React, { useMemo, useCallback, useEffect, useState } from "react";
import no_image_svg from "../assets/no-image-svgrepo-com.svg";
import { useRecentlyBorrowItems } from "../hooks/itemHooks";
import { FormattedDateTime } from "../components/FormattedDateTime.ts";
import { ViewRecentBorrowItems } from "../components/ViewRecentBorrowItems";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import ErrorTable from "../components/ErrorTables";
import {
  BookOpen,
  CalendarClock,
  ChevronRight,
  Hourglass,
  Info,
  PackageOpen,
  RotateCcw,
  SearchX,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { TRecentBorrowItemProps } from "../@types/types";
import { useReturnItemMutation } from "../query/patch/useReturnItemMutation";
import { showToast } from "../components/AppToast";
import ReturnConfirmationModal from "../components/ReturnConfirmationModal";
import ActiveBorrowedItemsSkeletonLoader from "../loader/ActiveBorrowedItemsSkeletonLoader";
import { useActiveBorrowedItemsState } from "../states/active-borrowed-items-state";
import { truncateRemarks } from "../components/truncateRemarks.tsx";
import { ACTIVE_BORROWED_ITEMS_CONTENT as T } from "../constants/activeBorrowedItemsContent";

const tableHeaders = T.tableHeaders;

const itemsPerPage = 10;
const HOUR_MS = 60 * 60 * 1000;
const LONG_HELD_MS = 24 * HOUR_MS;

type SortOrder = "newest" | "oldest";

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

const getInitials = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const getAvatarColor = (name?: string) => {
  const sum = [...(name ?? "")].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

const formatElapsed = (ms: number) => {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
};

// Pill color escalates the longer an item has been out
const elapsedTone = (ms: number) => {
  if (ms >= LONG_HELD_MS) return { pill: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" };
  if (ms >= 4 * HOUR_MS) return { pill: "bg-blue-50 text-blue-700 ring-blue-200", dot: "bg-blue-500" };
  return { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" };
};

const lentTime = (item: TRecentBorrowItemProps) => (item.lentAt ? new Date(item.lentAt).getTime() : NaN);

export default function ActiveBorrowedItems() {
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    selectedBorrowId,
    setSelectedBorrowId,
    itemToReturn,
    setItemToReturn,
  } = useActiveBorrowedItemsState();

  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [now, setNow] = useState(() => Date.now());

  // Tick every minute so "Time Out" stays live
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { data, isPending, isError } = useQuery(useRecentlyBorrowItems());
  const returnItemMutation = useReturnItemMutation();

  const borrowedItems: TRecentBorrowItemProps[] = useMemo(
    () => (Array.isArray(data) ? data.filter((item: TRecentBorrowItemProps) => item.status === "Borrowed") : []),
    [data],
  );

  const stats = useMemo(() => {
    const startOfToday = new Date(now).setHours(0, 0, 0, 0);
    return [
      { label: T.stats.active, value: borrowedItems.length, icon: PackageOpen, tone: "bg-blue-50 text-blue-600" },
      {
        label: T.stats.today,
        value: borrowedItems.filter((item) => lentTime(item) >= startOfToday).length,
        icon: CalendarClock,
        tone: "bg-emerald-50 text-emerald-600",
      },
      {
        label: T.stats.longHeld,
        value: borrowedItems.filter((item) => now - lentTime(item) >= LONG_HELD_MS).length,
        icon: Hourglass,
        tone: "bg-amber-50 text-amber-600",
      },
      {
        label: T.stats.borrowers,
        value: new Set(borrowedItems.map((item) => item.borrowerFullName).filter(Boolean)).size,
        icon: Users,
        tone: "bg-violet-50 text-violet-600",
      },
    ];
  }, [borrowedItems, now]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const matches = borrowedItems.filter(
      (item) =>
        item.item.itemName?.toLowerCase().includes(term) ||
        item.item.serialNumber?.toLowerCase().includes(term) ||
        item.borrowerFullName?.toLowerCase().includes(term),
    );
    return matches.sort((a, b) => {
      const diff = (lentTime(a) || 0) - (lentTime(b) || 0);
      return sortOrder === "newest" ? -diff : diff;
    });
  }, [borrowedItems, searchTerm, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  const paginatedData = useMemo(
    () => filteredData.slice((validCurrentPage - 1) * itemsPerPage, validCurrentPage * itemsPerPage),
    [filteredData, validCurrentPage],
  );

  const handlePageChange = useCallback((page: number) => setCurrentPage(page), [setCurrentPage]);

  const handleReturnClick = useCallback(
    (e: React.MouseEvent, item: TRecentBorrowItemProps) => {
      e.stopPropagation();
      if (!item.id) {
        showToast.error(T.toast.errorTitle, T.toast.idNotFound);
        return;
      }
      setItemToReturn(item);
    },
    [setItemToReturn],
  );

  const handleConfirmReturn = useCallback(async () => {
    if (!itemToReturn?.id) return;
    try {
      await returnItemMutation.mutateAsync(itemToReturn.id);
      showToast.success(T.toast.returnedTitle, T.toast.returnedMessage(itemToReturn.item.itemName));
      setItemToReturn(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : T.toast.returnFailed;
      showToast.error(T.toast.returnFailedTitle, msg);
    }
  }, [itemToReturn, returnItemMutation, setItemToReturn]);

  if (isPending) return <ActiveBorrowedItemsSkeletonLoader />;

  const sortOptions: { id: SortOrder; label: string }[] = [
    { id: "newest", label: T.sort.newest },
    { id: "oldest", label: T.sort.oldest },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">

        {/* Header */}
        <header>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">{T.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{T.description}</p>
        </header>

        {/* Summary */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-500">{stat.label}</p>
                <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{stat.value}</p>
              </div>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.tone}`}>
                <stat.icon className="h-5 w-5" />
              </span>
            </div>
          ))}
        </section>

        {/* Table card */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                {T.tableTitle}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  {T.liveLabel}
                </span>
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">{T.countLabel(filteredData.length)}</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="inline-flex rounded-lg bg-slate-100 p-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSortOrder(option.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      sortOrder === option.id
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <SearchBar
                onChangeValue={(value) => { setSearchTerm(value); setCurrentPage(1); }}
                name="search"
                placeholder={T.searchPlaceholder}
              />
            </div>
          </div>

          {isError ? (
            <ErrorTable />
          ) : (
            <>
              <div className="overflow-x-auto">
                <div className="max-h-[60vh] min-h-[45vh] overflow-y-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="sticky top-0 z-10 bg-slate-50">
                        {tableHeaders.map((header, i) => (
                          <th
                            key={`${header}-${i}`}
                            className="border-b border-slate-200 px-5 py-3 font-medium text-slate-500"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedData.length > 0 ? (
                        paginatedData.map((item, idx) => {
                          const elapsed = now - lentTime(item);
                          const hasElapsed = Number.isFinite(elapsed);
                          const longHeld = hasElapsed && elapsed >= LONG_HELD_MS;
                          const tone = elapsedTone(elapsed);

                          return (
                            <tr
                              key={item.id ?? idx}
                              onClick={() => setSelectedBorrowId(item.id)}
                              className={`group cursor-pointer transition-colors ${
                                longHeld ? "bg-amber-50/50 hover:bg-amber-50" : "hover:bg-slate-50"
                              }`}
                            >
                              {/* Item */}
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={typeof item.item.image === "string" ? item.item.image : no_image_svg}
                                    alt={item.item.itemName}
                                    className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 bg-slate-50 object-cover transition-transform group-hover:scale-105"
                                    onError={(e) => { e.currentTarget.src = no_image_svg; }}
                                  />
                                  <div className="min-w-0">
                                    <p className="font-medium text-slate-900">{item.item.itemName ?? "—"}</p>
                                    <p className="font-mono text-xs text-slate-500">{item.item.serialNumber ?? "—"}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Borrower */}
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(item.borrowerFullName)}`}
                                  >
                                    {getInitials(item.borrowerFullName)}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-slate-900">{item.borrowerFullName ?? "—"}</p>
                                    <p className="text-xs text-slate-500">
                                      {item.teacherFullName ? `${T.teacherPrefix} ${item.teacherFullName}` : T.noTeacher}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Room */}
                              <td className="px-5 py-3">
                                {item.room ? (
                                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                    {item.room}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>

                              {/* Lent At */}
                              <td className="px-5 py-3 text-slate-600">
                                {item.lentAt ? FormattedDateTime(item.lentAt) : <span className="text-slate-400">—</span>}
                              </td>

                              {/* Time Out */}
                              <td className="px-5 py-3">
                                {hasElapsed ? (
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums ring-1 ring-inset ${tone.pill}`}
                                    >
                                      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                                      {formatElapsed(elapsed)}
                                    </span>
                                    {longHeld && (
                                      <span className="text-xs font-medium text-amber-700">{T.longHeldBadge}</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>

                              {/* Remarks */}
                              <td className="max-w-48 truncate px-5 py-3 text-slate-500">
                                {truncateRemarks(item.remarks || "-")}
                              </td>

                              {/* Actions */}
                              <td className="px-5 py-3">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={(e) => handleReturnClick(e, item)}
                                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                                    title={T.returnButtonTitle}
                                  >
                                    <RotateCcw className="h-3.5 w-3.5 transition-transform group-hover:-rotate-45" />
                                    {T.returnButton}
                                  </button>
                                  <ChevronRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500" />
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={tableHeaders.length} className="px-8 py-20 text-center">
                            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                              {searchTerm ? (
                                <SearchX className="h-5 w-5 text-slate-400" />
                              ) : (
                                <BookOpen className="h-5 w-5 text-slate-400" />
                              )}
                            </span>
                            <p className="text-sm font-semibold text-slate-900">
                              {searchTerm ? T.empty.searchTitle : T.empty.title}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {searchTerm ? T.empty.searchDescription : T.empty.description}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <Pagination
                totalPages={totalPages || 1}
                currentPage={validCurrentPage}
                totalItems={filteredData.length}
                itemsPerPage={itemsPerPage}
                handlePageChange={handlePageChange}
              />

              <p className="flex items-start gap-2 border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
                <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>{T.footerHint}</span>
              </p>
            </>
          )}
        </section>
      </div>

      {/* Detail Modal */}
      {selectedBorrowId && (
        <ViewRecentBorrowItems
          itemId={selectedBorrowId}
          isOpen={!!selectedBorrowId}
          onClose={() => setSelectedBorrowId(null)}
        />
      )}

      {/* Return Confirmation Modal */}
      <ReturnConfirmationModal
        isOpen={!!itemToReturn}
        item={itemToReturn}
        onConfirm={handleConfirmReturn}
        onCancel={() => setItemToReturn(null)}
        isLoading={returnItemMutation.isPending}
      />
    </div>
  );
}
