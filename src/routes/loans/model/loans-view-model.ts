import { useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { AlarmClock, PackageOpen, Truck, TriangleAlert } from "lucide-react";
import type { LoanDto } from "../../../@types/types";
import { useAllLoans } from "../../../hooks/loanHooks";
import { useAllRooms } from "../../../hooks/assetHooks";
import { useLoansState } from "../../../states/loans-state";
import { countByStatus, filterLoans, isLoanStatusFilter, isOpenLoan, type LoanStatusFilter } from "../../../lib/loanFilters";
import { UserData } from "../../../utils/usersData/userData";
import { LOANS_CONTENT as T } from "../../../constants/loansContent";

export const ITEMS_PER_PAGE = 10;
export const EMPTY: LoanDto[] = [];
export const DUE_SOON_MS = 15 * 60_000;

export const TAB_TONE: Record<LoanStatusFilter, { active: string; badge: string }> = {
  all: { active: "border-blue-600 text-blue-600", badge: "bg-blue-100 text-blue-700" },
  ACTIVE: { active: "border-blue-600 text-blue-600", badge: "bg-blue-100 text-blue-700" },
  OVERDUE: { active: "border-rose-600 text-rose-600", badge: "bg-rose-100 text-rose-700" },
  RETURNED: { active: "border-emerald-600 text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
  MISSING: { active: "border-red-700 text-red-700", badge: "bg-red-100 text-red-700" },
};

export const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

export const getInitials = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export const getAvatarColor = (name?: string) => {
  const sum = [...(name ?? "")].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

export const time = (iso: string | null) => (iso ? new Date(iso).getTime() : NaN);

export const useLoansViewModel = () => {
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
  } = useLoansState();

  const [now, setNow] = useState(() => Date.now());
  const [searchResetKey, setSearchResetKey] = useState(0);

  const openLoan = useCallback(
    (loanId: string) => navigate({ to: "/home/loans/$loanId", params: { loanId } }),
    [navigate],
  );

  // Tick every 30 s so the transit and due countdowns stay live
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Room goes to the server (GET /loans?roomId=); status stays client-side so every tab keeps its count.
  // Instructors only see the loans they approved.
  const { data, isPending, isError, error, refetch } = useQuery({
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

  return {
    viewer,
    isInstructor,
    navigate,
    params,
    status,
    roomId,
    setFilters,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    sortOrder,
    setSortOrder,
    now,
    setNow,
    searchResetKey,
    setSearchResetKey,
    openLoan,
    data,
    isPending,
    isError,
    error,
    refetch,
    roomsData,
    loans,
    rooms,
    roomLoans,
    statusCounts,
    stats,
    filteredData,
    totalPages,
    validCurrentPage,
    paginatedData,
    handlePageChange,
  };
};

export type LoansViewModel = ReturnType<typeof useLoansViewModel>;
