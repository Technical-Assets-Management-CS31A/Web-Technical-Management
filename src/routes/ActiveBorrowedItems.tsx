import { useMemo, useCallback, useEffect, useState } from "react";
import { useAllLoans } from "../hooks/loanHooks";
import { FormattedDateTime } from "../components/FormattedDateTime.ts";
import LoanDetailDialog from "../components/LoanDetailDialog";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import ErrorTable from "../components/ErrorTables";
import { SlugStatus } from "../components/SlugStatus";
import {
  AlarmClock,
  BookOpen,
  ChevronRight,
  Info,
  PackageOpen,
  SearchX,
  Truck,
  TriangleAlert,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { LoanDto } from "../@types/types";
import ActiveBorrowedItemsSkeletonLoader from "../loader/ActiveBorrowedItemsSkeletonLoader";
import { useActiveBorrowedItemsState } from "../states/active-borrowed-items-state";
import { formatEnum } from "../lib/utils";
import { UserData } from "../utils/usersData/userData";
import { ACTIVE_BORROWED_ITEMS_CONTENT as T } from "../constants/activeBorrowedItemsContent";

const tableHeaders = T.tableHeaders;

const itemsPerPage = 10;

type SortOrder = "due" | "newest";

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

const formatDuration = (ms: number) => {
  const minutes = Math.floor(Math.abs(ms) / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
};

const time = (iso: string | null) => (iso ? new Date(iso).getTime() : NaN);
const borrowerName = (loan: LoanDto) => loan.student?.fullName ?? loan.coordinator?.fullName ?? "—";

export default function ActiveBorrowedItems() {
  const viewer = UserData();
  const isInstructor = viewer.role === "INSTRUCTOR";
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    selectedBorrowId,
    setSelectedBorrowId,
  } = useActiveBorrowedItemsState();

  const [sortOrder, setSortOrder] = useState<SortOrder>("due");
  const [now, setNow] = useState(() => Date.now());

  // Tick every 30 s so the transit and due countdowns stay live
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Instructors see only the loans they approved
  const { data, isPending, isError } = useQuery(useAllLoans(isInstructor ? { approvedBy: "me" } : {}));

  const loans: LoanDto[] = useMemo(
    () => (Array.isArray(data) ? data.filter((loan) => loan.status === "ACTIVE" || loan.status === "OVERDUE") : []),
    [data],
  );

  const stats = useMemo(() => [
    { label: T.stats.active, value: loans.length, icon: PackageOpen, tone: "bg-blue-50 text-blue-600" },
    {
      label: T.stats.inTransit,
      value: loans.filter((loan) => loan.custodyState === "AWAITING_ARRIVAL").length,
      icon: Truck,
      tone: "bg-sky-50 text-sky-600",
    },
    {
      label: T.stats.anomaly,
      value: loans.filter((loan) => loan.custodyState === "ANOMALY").length,
      icon: TriangleAlert,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      label: T.stats.overdue,
      value: loans.filter((loan) => loan.status === "OVERDUE").length,
      icon: AlarmClock,
      tone: "bg-rose-50 text-rose-600",
    },
  ], [loans]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const matches = loans.filter(
      (loan) =>
        loan.asset.name.toLowerCase().includes(term) ||
        loan.asset.assetCode.toLowerCase().includes(term) ||
        loan.loanNo.toLowerCase().includes(term) ||
        borrowerName(loan).toLowerCase().includes(term) ||
        (loan.student?.studentNo ?? "").toLowerCase().includes(term),
    );
    return matches.sort((a, b) =>
      sortOrder === "due"
        ? (time(a.dueAt) || 0) - (time(b.dueAt) || 0)
        : (time(b.checkedOutAt) || 0) - (time(a.checkedOutAt) || 0),
    );
  }, [loans, searchTerm, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  const paginatedData = useMemo(
    () => filteredData.slice((validCurrentPage - 1) * itemsPerPage, validCurrentPage * itemsPerPage),
    [filteredData, validCurrentPage],
  );

  const handlePageChange = useCallback((page: number) => setCurrentPage(page), [setCurrentPage]);

  if (isPending) return <ActiveBorrowedItemsSkeletonLoader />;

  const sortOptions: { id: SortOrder; label: string }[] = [
    { id: "due", label: T.sort.due },
    { id: "newest", label: T.sort.newest },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">

        {/* Header */}
        <header>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">{T.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{isInstructor ? T.instructorTitle : T.title}</h1>
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
                        paginatedData.map((loan) => {
                          const untilDue = time(loan.dueAt) - now;
                          const untilTransit = time(loan.transitDeadlineAt) - now;
                          const isOverdue = loan.status === "OVERDUE";
                          const name = borrowerName(loan);

                          return (
                            <tr
                              key={loan.id}
                              onClick={() => setSelectedBorrowId(loan.id)}
                              className={`group cursor-pointer transition-colors ${
                                isOverdue ? "bg-rose-50/50 hover:bg-rose-50" : loan.custodyState === "ANOMALY" ? "bg-amber-50/50 hover:bg-amber-50" : "hover:bg-slate-50"
                              }`}
                            >
                              {/* Asset */}
                              <td className="px-5 py-3">
                                <p className="font-medium text-slate-900">{loan.asset.name}</p>
                                <p className="font-mono text-xs text-slate-500">{loan.asset.assetCode} · {loan.loanNo}</p>
                              </td>

                              {/* Borrower */}
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                  {loan.photoUrl ? (
                                    <img src={loan.photoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                                  ) : (
                                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(name)}`}>
                                      {getInitials(name)}
                                    </span>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-slate-900">{name}</p>
                                    <p className="text-xs text-slate-500">
                                      {loan.type === "EVENT" ? T.eventLoan(loan.event?.title) : loan.student?.sectionCode ?? "—"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Instructor */}
                              <td className="px-5 py-3 text-slate-600">{loan.approvedBy?.fullName ?? <span className="text-slate-400">—</span>}</td>

                              {/* Room */}
                              <td className="px-5 py-3">
                                {loan.destinationRoom ? (
                                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                    {loan.destinationRoom.code}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>

                              {/* Checked out */}
                              <td className="px-5 py-3 text-slate-600">{FormattedDateTime(loan.checkedOutAt)}</td>

                              {/* Custody */}
                              <td className="px-5 py-3">
                                <span className={`rounded px-2 py-0.5 text-xs font-medium ${SlugStatus(loan.custodyState)}`}>
                                  {formatEnum(loan.custodyState)}
                                </span>
                                {loan.custodyState === "AWAITING_ARRIVAL" && Number.isFinite(untilTransit) && (
                                  <span className={`ml-2 text-xs tabular-nums ${untilTransit < 0 ? "text-amber-700" : "text-slate-500"}`}>
                                    {untilTransit < 0 ? T.transitLate(formatDuration(untilTransit)) : T.transitLeft(formatDuration(untilTransit))}
                                  </span>
                                )}
                              </td>

                              {/* Due */}
                              <td className="px-5 py-3">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums ring-1 ring-inset ${
                                  isOverdue ? "bg-rose-50 text-rose-700 ring-rose-200" : untilDue < 15 * 60_000 ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                }`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${isOverdue ? "bg-rose-500" : untilDue < 15 * 60_000 ? "bg-amber-500" : "bg-emerald-500"}`} />
                                  {isOverdue ? T.overdueBy(formatDuration(untilDue)) : T.dueIn(formatDuration(untilDue))}
                                </span>
                              </td>

                              {/* Open */}
                              <td className="px-5 py-3">
                                <ChevronRight className="ml-auto h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500" />
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
        <LoanDetailDialog loanId={selectedBorrowId} onClose={() => setSelectedBorrowId(null)} />
      )}
    </div>
  );
}
