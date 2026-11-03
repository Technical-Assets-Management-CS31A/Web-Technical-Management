import {
  queryOptions,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { changePasswordApi, meApi } from "../api/auth_api";
import {
  addAuthCardApi,
  allSectionsApi,
  allStudentsApi,
  allUsersApi,
  cancelKioskSessionApi,
  clearMarkApi,
  clearWarningApi,
  createSectionApi,
  createStudentApi,
  createUserApi,
  deleteStudentApi,
  deleteUserApi,
  getKioskSessionApi,
  getStudentApi,
  getStudentStandingApi,
  getUserApi,
  importStudentsApi,
  liftFreezeApi,
  liftHoldApi,
  resetTermWarningsApi,
  restoreStudentApi,
  restoreUserApi,
  settleLiabilityApi,
  startEnrollmentApi,
  updateAuthCardApi,
  updateStudentApi,
  updateUserApi,
} from "../api/user_api";

export const USERS_KEY = ["users"] as const;
export const STUDENTS_KEY = ["students"] as const;
export const SECTIONS_KEY = ["sections"] as const;

// ── Signed-in account ────────────────────────────────────────────────────────

export const useLoggedInUser = () => {
  return queryOptions({
    queryFn: meApi,
    queryKey: ["me"],
    staleTime: 5 * 60 * 1000
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePasswordApi,
    mutationKey: ["change-password"],
  });
};

// ── Staff and instructor accounts ────────────────────────────────────────────

export const useAllUsers = (includeDeleted = false) => {
  return queryOptions({
    queryFn: () => allUsersApi({ includeDeleted }),
    queryKey: [...USERS_KEY, { includeDeleted }],
    staleTime: 0,
    gcTime: 5 * 60 * 1000
  });
};

export const useGetUser = (id: string) => {
  return queryOptions({
    queryFn: () => getUserApi(id),
    queryKey: [...USERS_KEY, id],
    enabled: !!id,
  });
};

const useInvalidateUsers = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: USERS_KEY });
    queryClient.invalidateQueries({ queryKey: ["me"] });
  };
};

export const useCreateUser = () => {
  const onSuccess = useInvalidateUsers();
  return useMutation({ mutationFn: createUserApi, mutationKey: ["create-user"], onSuccess });
};

export const useUpdateUser = () => {
  const onSuccess = useInvalidateUsers();
  return useMutation({ mutationFn: updateUserApi, mutationKey: ["update-user"], onSuccess });
};

export const useDeleteUser = () => {
  const onSuccess = useInvalidateUsers();
  return useMutation({ mutationFn: deleteUserApi, mutationKey: ["delete-user"], onSuccess });
};

export const useRestoreUser = () => {
  const onSuccess = useInvalidateUsers();
  return useMutation({ mutationFn: restoreUserApi, mutationKey: ["restore-user"], onSuccess });
};

export const useAddAuthCard = () => {
  const onSuccess = useInvalidateUsers();
  return useMutation({ mutationFn: addAuthCardApi, mutationKey: ["auth-card"], onSuccess });
};

export const useUpdateAuthCard = () => {
  const onSuccess = useInvalidateUsers();
  return useMutation({ mutationFn: updateAuthCardApi, mutationKey: ["auth-card"], onSuccess });
};

export const useLiftFreeze = () => {
  const onSuccess = useInvalidateUsers();
  return useMutation({ mutationFn: liftFreezeApi, mutationKey: ["lift-freeze"], onSuccess });
};

// ── Students ─────────────────────────────────────────────────────────────────

export const useAllStudents = (includeDeleted = false) => {
  return queryOptions({
    queryFn: () => allStudentsApi({ includeDeleted }),
    queryKey: [...STUDENTS_KEY, { includeDeleted }],
    staleTime: 0,
    gcTime: 5 * 60 * 1000
  });
};

export const useGetStudent = (id: string) => {
  return queryOptions({
    queryFn: () => getStudentApi(id),
    queryKey: [...STUDENTS_KEY, id],
    enabled: !!id,
  });
};

const useInvalidateStudents = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: STUDENTS_KEY });
  };
};

export const useCreateStudent = () => {
  const onSuccess = useInvalidateStudents();
  return useMutation({ mutationFn: createStudentApi, mutationKey: ["create-student"], onSuccess });
};

export const useUpdateStudent = () => {
  const onSuccess = useInvalidateStudents();
  return useMutation({ mutationFn: updateStudentApi, mutationKey: ["update-student"], onSuccess });
};

export const useDeleteStudent = () => {
  const onSuccess = useInvalidateStudents();
  return useMutation({ mutationFn: deleteStudentApi, mutationKey: ["delete-student"], onSuccess });
};

export const useRestoreStudent = () => {
  const onSuccess = useInvalidateStudents();
  return useMutation({ mutationFn: restoreStudentApi, mutationKey: ["restore-student"], onSuccess });
};

export const useImportStudents = () => {
  const onSuccess = useInvalidateStudents();
  return useMutation({ mutationFn: importStudentsApi, mutationKey: ["import-students"], onSuccess });
};

export const useAllSections = () => {
  return queryOptions({
    queryFn: allSectionsApi,
    queryKey: SECTIONS_KEY,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSectionApi,
    mutationKey: ["create-section"],
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SECTIONS_KEY }),
  });
};

// ── Standing and penalties ───────────────────────────────────────────────────

export const useStudentStanding = (id: string) => {
  return queryOptions({
    queryFn: () => getStudentStandingApi(id),
    queryKey: ["standing", id],
    enabled: !!id,
    staleTime: 0,
  });
};

// Resolving any penalty changes the student's standing and counters.
const useInvalidateStanding = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["standing"] });
    queryClient.invalidateQueries({ queryKey: STUDENTS_KEY });
  };
};

export const useClearWarning = () => {
  const onSuccess = useInvalidateStanding();
  return useMutation({ mutationFn: clearWarningApi, mutationKey: ["clear-warning"], onSuccess });
};

export const useClearMark = () => {
  const onSuccess = useInvalidateStanding();
  return useMutation({ mutationFn: clearMarkApi, mutationKey: ["clear-mark"], onSuccess });
};

export const useLiftHold = () => {
  const onSuccess = useInvalidateStanding();
  return useMutation({ mutationFn: liftHoldApi, mutationKey: ["lift-hold"], onSuccess });
};

export const useSettleLiability = () => {
  const onSuccess = useInvalidateStanding();
  return useMutation({ mutationFn: settleLiabilityApi, mutationKey: ["settle-liability"], onSuccess });
};

export const useResetTermWarnings = () => {
  const onSuccess = useInvalidateStanding();
  return useMutation({ mutationFn: resetTermWarningsApi, mutationKey: ["reset-term"], onSuccess });
};

// ── Fingerprint enrollment ───────────────────────────────────────────────────

export const useStartEnrollment = () => {
  return useMutation({
    mutationFn: startEnrollmentApi,
    mutationKey: ["enrollment"],
  });
};

export const useGetKioskSession = (sessionId: string) => {
  return queryOptions({
    queryFn: () => getKioskSessionApi(sessionId),
    queryKey: ["kioskSession", sessionId],
    enabled: !!sessionId,
    staleTime: 0,
    refetchInterval: 2000,
  });
};

export const useCancelKioskSession = () => {
  return useMutation({
    mutationFn: cancelKioskSessionApi,
    mutationKey: ["kioskSession"],
  });
};
