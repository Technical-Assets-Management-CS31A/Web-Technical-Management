import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  activeKioskSessionsApi,
  allLoansApi,
  changeLoanRoomApi,
  dashboardSummaryApi,
  getLoanApi,
  markLoanMissingApi,
  stationHealthApi,
  uploadSessionPhotoApi,
} from "../api/loan_api";
import type { LoanFilters } from "../@types/types";

export const LOANS_KEY = ["loans"] as const;

export const useAllLoans = (filters: LoanFilters = {}) => {
  return queryOptions({
    queryFn: () => allLoansApi(filters),
    queryKey: [...LOANS_KEY, filters],
    staleTime: 30 * 1000,
  });
};

export const useGetLoan = (id: string) => {
  return queryOptions({
    queryFn: () => getLoanApi(id),
    queryKey: [...LOANS_KEY, id],
    enabled: !!id,
  });
};

const useInvalidateLoans = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: LOANS_KEY });
    queryClient.invalidateQueries({ queryKey: ["assets"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
};

export const useMarkLoanMissing = () => {
  const onSuccess = useInvalidateLoans();
  return useMutation({ mutationFn: markLoanMissingApi, mutationKey: ["mark-missing"], onSuccess });
};

export const useChangeLoanRoom = () => {
  const onSuccess = useInvalidateLoans();
  return useMutation({ mutationFn: changeLoanRoomApi, mutationKey: ["change-room"], onSuccess });
};

// ── Live board ───────────────────────────────────────────────────────────────

export const useDashboardSummary = () => {
  return queryOptions({
    queryFn: dashboardSummaryApi,
    queryKey: ["dashboard", "summary"],
    staleTime: 30 * 1000,
  });
};

export const useStationHealth = () => {
  return queryOptions({
    queryFn: stationHealthApi,
    queryKey: ["dashboard", "stations"],
    staleTime: 30 * 1000,
  });
};

// ── Kiosk sessions ───────────────────────────────────────────────────────────

export const useActiveKioskSessions = () => {
  return queryOptions({
    queryFn: activeKioskSessionsApi,
    queryKey: ["kioskSessions", "active"],
    staleTime: 0,
    refetchInterval: 2000,
  });
};

export const useUploadSessionPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadSessionPhotoApi,
    mutationKey: ["session-photo"],
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kioskSessions"] }),
  });
};
