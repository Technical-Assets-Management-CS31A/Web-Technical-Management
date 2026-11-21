import type { LoanDto, LoanStatus } from "../@types/types";

// Pure helpers for the Loans list (PRD 6.5). Kept out of the component so they can be unit tested.

export type LoanStatusFilter = "all" | LoanStatus;
export type LoanSortOrder = "newest" | "due";

export const LOAN_STATUS_FILTERS: LoanStatusFilter[] = ["all", "ACTIVE", "OVERDUE", "RETURNED", "MISSING"];

export const isLoanStatusFilter = (value: unknown): value is LoanStatusFilter =>
  typeof value === "string" && (LOAN_STATUS_FILTERS as string[]).includes(value);

/** A loan the asset has not come back from yet. */
export const isOpenLoan = (loan: LoanDto) => loan.status === "ACTIVE" || loan.status === "OVERDUE";

export const borrowerName = (loan: LoanDto) => loan.student?.fullName ?? loan.coordinator?.fullName ?? "—";

const time = (iso: string | null | undefined) => {
  const t = iso ? new Date(iso).getTime() : NaN;
  return Number.isFinite(t) ? t : 0;
};

export const countByStatus = (loans: LoanDto[]): Record<LoanStatusFilter, number> => {
  const counts: Record<LoanStatusFilter, number> = { all: loans.length, ACTIVE: 0, OVERDUE: 0, RETURNED: 0, MISSING: 0 };
  for (const loan of loans) counts[loan.status] += 1;
  return counts;
};

export const matchesLoanSearch = (loan: LoanDto, term: string) => {
  const q = term.trim().toLowerCase();
  if (!q) return true;
  return [
    loan.loanNo,
    loan.asset.name,
    loan.asset.assetCode,
    borrowerName(loan),
    loan.student?.studentNo,
    loan.approvedBy?.fullName,
    loan.destinationRoom?.code,
    loan.event?.title,
  ].some((field) => (field ?? "").toLowerCase().includes(q));
};

/**
 * Filters by status, room and search text, then sorts.
 * "due" puts open loans first, soonest due on top; closed loans follow, newest first.
 */
export const filterLoans = (
  loans: LoanDto[],
  { status = "all", roomId = "", search = "", sort = "newest" }: {
    status?: LoanStatusFilter;
    roomId?: string;
    search?: string;
    sort?: LoanSortOrder;
  },
): LoanDto[] => {
  const result = loans.filter(
    (loan) =>
      (status === "all" || loan.status === status) &&
      (!roomId || loan.destinationRoom?.id === roomId) &&
      matchesLoanSearch(loan, search),
  );

  return result.sort((a, b) => {
    if (sort === "due") {
      const openDiff = Number(isOpenLoan(b)) - Number(isOpenLoan(a));
      if (openDiff !== 0) return openDiff;
      if (isOpenLoan(a)) return time(a.dueAt) - time(b.dueAt);
    }
    return time(b.checkedOutAt) - time(a.checkedOutAt);
  });
};

export const formatDuration = (ms: number) => {
  const minutes = Math.floor(Math.abs(ms) / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
};
