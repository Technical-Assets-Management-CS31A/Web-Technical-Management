import { useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  AlarmClock,
  BookOpen,
  ChevronRight,
  Info,
  PackageOpen,
  SearchX,
  Truck,
  TriangleAlert,
  X,
} from "lucide-react";
import type { LoanDto } from "../@types/types";
import { useAllLoans } from "../hooks/loanHooks";
import { useAllRooms } from "../hooks/assetHooks";
import { FormattedDateTime } from "../components/FormattedDateTime";
import LoanDetailDialog from "../components/LoanDetailDialog";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import ErrorTable from "../components/ErrorTables";
import { SlugStatus } from "../components/SlugStatus";
import LoansSkeletonLoader from "../loader/LoansSkeletonLoader";
import { useLoansState } from "../states/loans-state";
import { formatEnum } from "../lib/utils";
import {
  LOAN_STATUS_FILTERS,
  borrowerName,
  countByStatus,
  filterLoans,
  formatDuration,
  isLoanStatusFilter,
  isOpenLoan,
  type LoanSortOrder,
  type LoanStatusFilter,
} from "../lib/loanFilters";
import { UserData } from "../utils/usersData/userData";
import { LOANS_CONTENT as T } from "../constants/loansContent";

// PRD 6.5 Loans: a read-only list of active and past loans from the kiosk flow.
// The web never creates a borrow; staff actions (mark missing, change room) live in LoanDetailDialog.

const ITEMS_PER_PAGE = 10;
const EMPTY: LoanDto[] = [];
const DUE_SOON_MS = 15 * 60_000;

const TAB_TONE: Record<LoanStatusFilter, { active: string; badge: string }> = {
  all: { active: "border-blue-600 text-blue-600", badge: "bg-blue-100 text-blue-700" },
  ACTIVE: { active: "border-blue-600 text-blue-600", badge: "bg-blue-100 text-blue-700" },
  OVERDUE: { active: "border-rose-600 text-rose-600", badge: "bg-rose-100 text-rose-700" },
  RETURNED: { active: "border-emerald-600 text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
  MISSING: { active: "border-red-700 text-red-700", badge: "bg-red-100 text-red-700" },
};

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

const time = (iso: string | null) => (iso ? new Date(iso).getTime() : NaN);

export default function Loans() {
  const viewer = UserData();
  const isInstructor = viewer.role === "INSTRUCTOR";
  const navigate = useNavigate();

  // Status and room come from the URL so the dashboard and sidebar can deep-link a filter.
  const params = useSearch({ strict: false }) as { status?: string; roomId?: string };
  const status: LoanStatusFilter = isLoanStatusFilter(params.status) ? params.status : "all";
  const roomId = params.roomId ?? "";

  const setFilters = useCallback(
    (next: { status?: LoanStatusFilter; roomId?: string }) => {
      const merged = { status, roomId, ...next };
      navigate({
        to: "/home/loans",
        search: {
          ...(merged.status !== "all" ? { status: merged.status } : {}),
          ...(merged.roomId ? { roomId: merged.roomId } : {}),
        },
        replace: true,
      });
    },
    [navigate, status, roomId],
  );

  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    sortOrder,
    setSortOrder,
    selectedLoanId,
    setSelectedLoanId,
  } = useLoansState();

  const [now, setNow] = useState(() => Date.now());

  // Tick every 30 s so the transit and due countdowns stay live
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Room goes to the server (GET /loans?roomId=); status stays client-side so every tab keeps its count.
  // Instructors only see the loans they approved.
  const { data, isPending, isError } = useQuery({
    ...useAllLoans({
      ...(isInstructor ? { approvedBy: "me" as const } : {}),
      ...(roomId ? { roomId } : {}),
    }),
    placeholderData: keepPreviousData,
  });
  const { data: roomsData } = useQuery(useAllRooms());

  const loans = Array.isArray(data) ? data : EMPTY;

  const rooms = useMemo(
    () => (Array.isArray(roomsData) ? roomsData : []).filter((room) => !room.isStorage).sort((a, b) => a.code.localeCompare(b.code)),
    [roomsData],
  );

  // Room filter is applied once here too, in case the API ignores the param.
  const roomLoans = useMemo(() => filterLoans(loans, { roomId }), [loans, roomId]);
  const statusCounts = useMemo(() => countByStatus(roomLoans), [roomLoans]);

  const stats = useMemo(() => {
    const open = roomLoans.filter(isOpenLoan);
    return [
      { label: T.stats.active, value: open.length, icon: PackageOpen, tone: "bg-blue-50 text-blue-600" },
      { label: T.stats.inTransit, value: open.filter((l) => l.custodyState === "AWAITING_ARRIVAL").length, icon: Truck, tone: "bg-sky-50 text-sky-600" },
      { label: T.stats.anomaly, value: open.filter((l) => l.custodyState === "ANOMALY").length, icon: TriangleAlert, tone: "bg-amber-50 text-amber-600" },
      { label: T.stats.overdue, value: statusCounts.OVERDUE, icon: AlarmClock, tone: "bg-rose-50 text-rose-600" },
    ];
  }, [roomLoans, statusCounts]);

  const filteredData = useMemo(
    () => filterLoans(roomLoans, { status, search: searchTerm, sort: sortOrder }),
    [roomLoans, status, searchTerm, sortOrder],
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  const paginatedData = useMemo(
    () => filteredData.slice((validCurrentPage - 1) * ITEMS_PER_PAGE, validCurrentPage * ITEMS_PER_PAGE),
    [filteredData, validCurrentPage],
  );

  const handlePageChange = useCallback((page: number) => setCurrentPage(page), [setCurrentPage]);

  if (isPending) return <LoansSkeletonLoader />;

  const isFiltered = status !== "all" || !!roomId || !!searchTerm;

  const sortOptions: { id: LoanSortOrder; label: string }[] = [
    { id: "newest", label: T.sort.newest },
    { id: "due", label: T.sort.due },
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

          {/* Status tabs */}
          <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3" role="tablist" aria-label="Filter by status">
            {LOAN_STATUS_FILTERS.map((id) => (
              <button
                key={id}
                role="tab"
                aria-selected={status === id}
                onClick={() => { setFilters({ status: id }); setCurrentPage(1); }}
                className={`-mb-px whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                  status === id ? TAB_TONE[id].active : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {T.tabs[id]}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs tabular-nums ${status === id ? TAB_TONE[id].badge : "bg-slate-100 text-slate-500"}`}>
                  {statusCounts[id]}
                </span>
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                {status === "all" ? T.tableTitle : T.tabs[status]}
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

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
                {T.roomFilter.label}
                <select
                  value={roomId}
                  onChange={(e) => { setFilters({ roomId: e.target.value }); setCurrentPage(1); }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">{T.roomFilter.all}</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>{room.code} — {room.name}</option>
                  ))}
                </select>
              </label>

              <div className="inline-flex rounded-lg bg-slate-100 p-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSortOrder(option.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      sortOrder === option.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <SearchBar
                onChangeValue={setSearchTerm}
                defaultValue={searchTerm}
                name="search"
                placeholder={T.searchPlaceholder}
              />

              {(status !== "all" || roomId) && (
                <button
                  onClick={() => { setFilters({ status: "all", roomId: "" }); setCurrentPage(1); }}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                  {T.clearFilters}
                </button>
              )}
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
                        {T.tableHeaders.map((header, i) => (
                          <th key={`${header}-${i}`} className="border-b border-slate-200 px-5 py-3 font-medium text-slate-500">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedData.length > 0 ? (
                        paginatedData.map((loan) => (
                          <LoanRow key={loan.id} loan={loan} now={now} onSelect={setSelectedLoanId} />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={T.tableHeaders.length} className="px-8 py-20 text-center">
                            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                              {isFiltered ? <SearchX className="h-5 w-5 text-slate-400" /> : <BookOpen className="h-5 w-5 text-slate-400" />}
                            </span>
                            <p className="text-sm font-semibold text-slate-900">{isFiltered ? T.empty.filteredTitle : T.empty.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{isFiltered ? T.empty.filteredDescription : T.empty.description}</p>
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
                itemsPerPage={ITEMS_PER_PAGE}
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

      {selectedLoanId && <LoanDetailDialog loanId={selectedLoanId} onClose={() => setSelectedLoanId(null)} />}
    </div>
  );
}

function LoanRow({ loan, now, onSelect }: { loan: LoanDto; now: number; onSelect: (id: string) => void }) {
  const open = isOpenLoan(loan);
  const isOverdue = loan.status === "OVERDUE";
  const untilDue = time(loan.dueAt) - now;
  const untilTransit = time(loan.transitDeadlineAt) - now;
  const name = borrowerName(loan);

  const rowTone = isOverdue
    ? "bg-rose-50/50 hover:bg-rose-50"
    : open && loan.custodyState === "ANOMALY"
      ? "bg-amber-50/50 hover:bg-amber-50"
      : "hover:bg-slate-50";

  const dueTone = isOverdue
    ? { pill: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" }
    : untilDue < DUE_SOON_MS
      ? { pill: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" }
      : { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" };

  return (
    <tr
      onClick={() => onSelect(loan.id)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(loan.id); } }}
      tabIndex={0}
      className={`group cursor-pointer transition-colors focus:outline-none focus-visible:bg-slate-100 ${rowTone}`}
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

      {/* Approved by */}
      <td className="px-5 py-3 text-slate-600">{loan.approvedBy?.fullName ?? <span className="text-slate-400">—</span>}</td>

      {/* Room */}
      <td className="px-5 py-3">
        {loan.destinationRoom ? (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{loan.destinationRoom.code}</span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>

      {/* Checked out */}
      <td className="px-5 py-3 text-slate-600">{FormattedDateTime(loan.checkedOutAt)}</td>

      {/* Custody: only meaningful while the asset is out */}
      <td className="px-5 py-3">
        {open ? (
          <>
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${SlugStatus(loan.custodyState)}`}>{formatEnum(loan.custodyState)}</span>
            {loan.custodyState === "AWAITING_ARRIVAL" && Number.isFinite(untilTransit) && (
              <span className={`ml-2 text-xs tabular-nums ${untilTransit < 0 ? "text-amber-700" : "text-slate-500"}`}>
                {untilTransit < 0 ? T.transitLate(formatDuration(untilTransit)) : T.transitLeft(formatDuration(untilTransit))}
              </span>
            )}
          </>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>

      {/* Due countdown while out; return time once closed */}
      <td className="px-5 py-3">
        {open && Number.isFinite(untilDue) ? (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums ring-1 ring-inset ${dueTone.pill}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dueTone.dot}`} />
            {isOverdue ? T.overdueBy(formatDuration(untilDue)) : T.dueIn(formatDuration(untilDue))}
          </span>
        ) : loan.returnedAt ? (
          <span className="text-slate-600">{FormattedDateTime(loan.returnedAt)}</span>
        ) : (
          <span className="text-slate-400">{T.notReturned}</span>
        )}
      </td>

      {/* Status */}
      <td className="px-5 py-3">
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${SlugStatus(loan.status)}`}>{formatEnum(loan.status)}</span>
      </td>

      {/* Open */}
      <td className="px-5 py-3">
        <ChevronRight className="ml-auto h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500" />
      </td>
    </tr>
  );
}
