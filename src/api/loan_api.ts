import { api } from "./axios";
import { fetchAllPages, toListQuery, toPaged } from "./paging";
import type {
  ChangeLoanRoomRequest,
  CheckoutSessionDto,
  FailSessionRequest,
  DashboardSummaryDto,
  LoanDto,
  LoanFilters,
  ListParams,
  Paged,
  ResolveRequest,
  RoomOccupancyDto,
  StationHealthDto,
} from "../@types/types";

const loan_end_point = "/loans";

// Loans are created only by a kiosk session; the web lists and manages them.

export const listLoansApi = async (params: LoanFilters & ListParams): Promise<Paged<LoanDto>> => {
  const response = await api.get(loan_end_point, { params: toListQuery(params) });
  return toPaged<LoanDto>(response.data, params);
};

/** Every loan matching the filters, fetched page by page so a paged response does not hide loans. */
export const allLoansApi = async (filters: LoanFilters = {}): Promise<LoanDto[]> =>
  fetchAllPages(listLoansApi, filters);

export const getLoanApi = async (id: string): Promise<LoanDto> => {
  const response = await api.get(`${loan_end_point}/${id}`);
  return response.data.data;
};

export const markLoanMissingApi = async ({ id, data }: { id: string; data: ResolveRequest }) => {
  const response = await api.post(`${loan_end_point}/${id}/mark-missing`, data);
  return response.data;
};

export const changeLoanRoomApi = async ({ id, data }: { id: string; data: ChangeLoanRoomRequest }) => {
  const response = await api.put(`${loan_end_point}/${id}/room`, data);
  return response.data;
};

// ── Live board ───────────────────────────────────────────────────────────────

// Team call: one summary endpoint instead of several calls.
export const dashboardSummaryApi = async (): Promise<DashboardSummaryDto> => {
  const response = await api.get("/dashboard/summary");
  return response.data.data;
};

export const roomOccupancyApi = async (roomId: string): Promise<RoomOccupancyDto> => {
  const response = await api.get(`/rooms/${roomId}/occupancy`);
  return response.data.data;
};

export const stationHealthApi = async (): Promise<StationHealthDto[]> => {
  const response = await api.get("/stations/health");
  return response.data.data;
};

// ── Kiosk sessions ───────────────────────────────────────────────────────────

export const activeKioskSessionsApi = async (): Promise<CheckoutSessionDto[]> => {
  const response = await api.get("/kiosk/sessions", { params: { active: true } });
  return response.data.data;
};

// PRD 6.2 step 5. Used to read a session's final result after it leaves the active list.
export const getKioskSessionApi = async (id: string): Promise<CheckoutSessionDto> => {
  const response = await api.get(`/kiosk/sessions/${id}`);
  return response.data.data;
};

// The counter computer's USB webcam supplies the checkout photo (team decision, 28 Oct).
export const uploadSessionPhotoApi = async ({ sessionId, photo }: { sessionId: string; photo: File }) => {
  const body = new FormData();
  body.append("photo", photo);
  const response = await api.post(`/kiosk/sessions/${sessionId}/photo`, body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Team call: the PRD has no endpoint for this. After the photo retry fails, the session ends FAILED
// with failure_code PHOTO_FAILED and the kiosk LCD shows "Camera error / Borrow denied / See lab staff".
export const failKioskSessionApi = async ({ sessionId, data }: { sessionId: string; data: FailSessionRequest }) => {
  const response = await api.post(`/kiosk/sessions/${sessionId}/fail`, data);
  return response.data;
};
