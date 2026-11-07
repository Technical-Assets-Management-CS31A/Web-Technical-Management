import { api } from "./axios";
import { fetchAllPages, toListQuery, toPaged } from "./paging";
import type {
  AuthCardRequest,
  CheckoutSessionDto,
  CreateUserRequest,
  Paged,
  RosterImportIssue,
  RosterImportResult,
  ResolveRequest,
  SectionDto,
  SectionForm,
  SettleLiabilityRequest,
  StudentDto,
  StudentForm,
  StudentListParams,
  StudentStandingDto,
  UpdateUserRequest,
  UserDto,
  UserListParams,
  UserRole,
} from "../@types/types";

type ListOptions = { includeDeleted?: boolean };

// ── Staff and instructor accounts (users table) ──────────────────────────────

export const listUsersApi = async (params: UserListParams): Promise<Paged<UserDto>> => {
  const response = await api.get("/users", { params: toListQuery(params) });
  return toPaged<UserDto>(response.data, params);
};

// Accounts are a short list (staff plus instructors), so the screen loads them all.
export const allUsersApi = async (
  { role, includeDeleted }: ListOptions & { role?: UserRole } = {},
): Promise<UserDto[]> => fetchAllPages(listUsersApi, { role, includeDeleted, sort: "lastName" });

export const getUserApi = async (id: string): Promise<UserDto> => {
  const response = await api.get(`/users/${id}`);
  return response.data.data;
};

export const createUserApi = async (data: CreateUserRequest): Promise<UserDto> => {
  const response = await api.post("/users", data);
  return response.data.data;
};

export const updateUserApi = async ({ id, data }: { id: string; data: UpdateUserRequest }) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

// Soft delete: sets deletedAt.
export const deleteUserApi = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Team call: restore is not in the PRD.
export const restoreUserApi = async (id: string) => {
  const response = await api.post(`/users/${id}/restore`);
  return response.data;
};

export const addAuthCardApi = async ({ userId, data }: { userId: string; data: AuthCardRequest }) => {
  const response = await api.post(`/users/${userId}/auth-cards`, data);
  return response.data;
};

export const updateAuthCardApi = async ({ cardId, data }: { cardId: string; data: Pick<AuthCardRequest, "status"> }) => {
  const response = await api.put(`/auth-cards/${cardId}`, data);
  return response.data;
};

export const liftFreezeApi = async ({ id, data }: { id: string; data: ResolveRequest }) => {
  const response = await api.post(`/freezes/${id}/lift`, data);
  return response.data;
};

// ── Students (roster records, no login) ──────────────────────────────────────

export const listStudentsApi = async (params: StudentListParams): Promise<Paged<StudentDto>> => {
  const response = await api.get("/students", { params: toListQuery(params) });
  return toPaged<StudentDto>(response.data, params);
};

export const allStudentsApi = async ({ includeDeleted }: ListOptions = {}): Promise<StudentDto[]> =>
  fetchAllPages(listStudentsApi, { includeDeleted });

export const getStudentApi = async (id: string): Promise<StudentDto> => {
  const response = await api.get(`/students/${id}`);
  return response.data.data;
};

export const createStudentApi = async (data: StudentForm): Promise<StudentDto> => {
  const response = await api.post("/students", data);
  return response.data.data;
};

export const updateStudentApi = async ({ id, data }: { id: string; data: StudentForm }) => {
  const response = await api.put(`/students/${id}`, data);
  return response.data;
};

export const deleteStudentApi = async (id: string) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

export const restoreStudentApi = async (id: string) => {
  const response = await api.post(`/students/${id}/restore`);
  return response.data;
};

const num = (value: unknown) => (typeof value === "number" ? value : null);

/**
 * The import report shape is not in the PRD yet. Accepts counts named
 * created/inserted, updated, skipped and an errors (or rowErrors) list.
 */
const toImportResult = (body: unknown): RosterImportResult => {
  const root = (body ?? {}) as Record<string, unknown>;
  const data = (root.data && typeof root.data === "object" ? root.data : root) as Record<string, unknown>;
  const rawErrors = (data.errors ?? data.rowErrors ?? []) as unknown[];
  const errors: RosterImportIssue[] = Array.isArray(rawErrors)
    ? rawErrors.map((e) => {
        const err = (e ?? {}) as Record<string, unknown>;
        return {
          line: num(err.line) ?? num(err.row) ?? num(err.rowNumber),
          studentNo: (err.studentNo as string | undefined) ?? null,
          message: String(err.message ?? err.detail ?? err.error ?? e),
        };
      })
    : [];
  return {
    created: num(data.created) ?? num(data.inserted) ?? num(data.createdCount),
    updated: num(data.updated) ?? num(data.updatedCount),
    skipped: num(data.skipped) ?? num(data.skippedCount),
    sectionsCreated: num(data.sectionsCreated),
    errors,
  };
};

// CSV upload (FR-9.3). Columns: studentNo, firstName, lastName, sectionCode, schoolYear.
export const importStudentsApi = async (formData: FormData): Promise<RosterImportResult> => {
  const response = await api.post("/students:import", formData);
  return toImportResult(response.data);
};

export const allSectionsApi = async (): Promise<SectionDto[]> => {
  const response = await api.get("/sections", { params: { page: 1, pageSize: 200, sort: "code" } });
  return toPaged<SectionDto>(response.data, { page: 1, pageSize: 200 }).items;
};

export const createSectionApi = async (data: SectionForm): Promise<SectionDto> => {
  const response = await api.post("/sections", data);
  return response.data.data;
};

// ── Standing and penalty resolution ──────────────────────────────────────────

export const getStudentStandingApi = async (id: string): Promise<StudentStandingDto> => {
  const response = await api.get(`/students/${id}/standing`);
  return response.data.data;
};

export const clearWarningApi = async ({ id, data }: { id: string; data: ResolveRequest }) => {
  const response = await api.post(`/warnings/${id}/clear`, data);
  return response.data;
};

export const clearMarkApi = async ({ id, data }: { id: string; data: ResolveRequest }) => {
  const response = await api.post(`/marks/${id}/clear`, data);
  return response.data;
};

export const liftHoldApi = async ({ id, data }: { id: string; data: ResolveRequest }) => {
  const response = await api.post(`/holds/${id}/lift`, data);
  return response.data;
};

export const settleLiabilityApi = async ({ id, data }: { id: string; data: SettleLiabilityRequest }) => {
  const response = await api.post(`/liabilities/${id}/settle`, data);
  return response.data;
};

export const resetTermWarningsApi = async (data: ResolveRequest) => {
  const response = await api.post("/warnings/reset-term", data);
  return response.data;
};

// ── Fingerprint enrollment (kiosk ENROLLMENT session started by an admin) ────

// PRD 6.3: POST /kiosk/{stationCode}/sessions with session_type ENROLLMENT, on the counter kiosk.
export const startEnrollmentApi = async (
  { studentId, stationCode }: { studentId: string; stationCode: string },
): Promise<CheckoutSessionDto> => {
  const response = await api.post(`/kiosk/${encodeURIComponent(stationCode)}/sessions`, { type: "ENROLLMENT", studentId });
  return response.data.data;
};

export const getKioskSessionApi = async (sessionId: string): Promise<CheckoutSessionDto> => {
  const response = await api.get(`/kiosk/sessions/${sessionId}`);
  return response.data.data;
};

export const cancelKioskSessionApi = async (sessionId: string) => {
  const response = await api.post(`/kiosk/sessions/${sessionId}/cancel`);
  return response.data;
};
