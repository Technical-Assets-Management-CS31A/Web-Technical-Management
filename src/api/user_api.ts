import { api } from "./axios";
import type {
  AuthCardRequest,
  CheckoutSessionDto,
  CreateUserRequest,
  ResolveRequest,
  SectionDto,
  SectionForm,
  SettleLiabilityRequest,
  StudentDto,
  StudentForm,
  StudentStandingDto,
  UpdateUserRequest,
  UserDto,
  UserRole,
} from "../@types/types";

type ListOptions = { includeDeleted?: boolean };

// ── Staff and instructor accounts (users table) ──────────────────────────────

export const allUsersApi = async (
  { role, includeDeleted }: ListOptions & { role?: UserRole } = {},
): Promise<UserDto[]> => {
  const response = await api.get("/users", { params: { role, includeDeleted } });
  return response.data.data;
};

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

export const allStudentsApi = async ({ includeDeleted }: ListOptions = {}): Promise<StudentDto[]> => {
  const response = await api.get("/students", { params: { includeDeleted } });
  return response.data.data;
};

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

export const importStudentsApi = async (formData: FormData) => {
  const response = await api.post("/students:import", formData);
  return response.data;
};

export const allSectionsApi = async (): Promise<SectionDto[]> => {
  const response = await api.get("/sections");
  return response.data.data;
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

export const startEnrollmentApi = async (studentId: string): Promise<CheckoutSessionDto> => {
  const response = await api.post("/kiosk/sessions", { type: "ENROLLMENT", studentId });
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
