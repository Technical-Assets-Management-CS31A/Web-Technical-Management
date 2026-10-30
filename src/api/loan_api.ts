import { api } from "./axios";
import type {
  ChangeLoanRoomRequest,
  CheckoutSessionDto,
  DashboardSummaryDto,
  LoanDto,
  LoanFilters,
  ResolveRequest,
  RoomOccupancyDto,
  StationHealthDto,
} from "../@types/types";

const loan_end_point = "/loans";

// Loans are created only by a kiosk session; the web lists and manages them.

export const allLoansApi = async (filters: LoanFilters = {}): Promise<LoanDto[]> => {
  const response = await api.get(loan_end_point, { params: filters });
  return response.data.data;
};

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

// The counter computer's USB webcam supplies the checkout photo (team decision, 28 Oct).
export const uploadSessionPhotoApi = async ({ sessionId, photo }: { sessionId: string; photo: File }) => {
  const body = new FormData();
  body.append("photo", photo);
  const response = await api.post(`/kiosk/sessions/${sessionId}/photo`, body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
