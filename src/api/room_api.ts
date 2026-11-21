import { api } from "./axios";
import type { RoomDto, RoomForm, StationDto, StationForm } from "../@types/types";

// The room list itself is allRoomsApi in asset_api.ts; asset and account forms use it too.

const room_end_point = "/rooms";
const station_end_point = "/stations";

// ── Rooms ────────────────────────────────────────────────────────────────────

const toRoomBody = (data: RoomForm) => ({
  ...data,
  code: data.code.trim().toUpperCase(),
  name: data.name.trim(),
  building: data.building.trim(),
  floor: data.floor.trim(),
});

// Team call: room writes are not in PRD section 6.
export const createRoomApi = async (data: RoomForm): Promise<RoomDto> => {
  const response = await api.post(room_end_point, toRoomBody(data));
  return response.data.data;
};

export const updateRoomApi = async ({ id, data }: { id: string; data: RoomForm }): Promise<RoomDto> => {
  const response = await api.put(`${room_end_point}/${id}`, toRoomBody(data));
  return response.data.data;
};

// Soft delete: sets deletedAt.
export const deleteRoomApi = async (id: string) => {
  const response = await api.delete(`${room_end_point}/${id}`);
  return response.data;
};

// ── Stations ─────────────────────────────────────────────────────────────────

const toStationBody = (data: StationForm) => ({
  ...data,
  stationCode: data.stationCode.trim().toUpperCase(),
  ipAddress: data.ipAddress.trim() || null,
});

// Team call: the PRD lists GET /stations/health only; this returns the full StationDto list.
export const allStationsApi = async (): Promise<StationDto[]> => {
  const response = await api.get(station_end_point);
  return response.data.data;
};

export const createStationApi = async (data: StationForm): Promise<StationDto> => {
  const response = await api.post(station_end_point, toStationBody(data));
  return response.data.data;
};

export const updateStationApi = async ({ id, data }: { id: string; data: StationForm }): Promise<StationDto> => {
  const response = await api.put(`${station_end_point}/${id}`, toStationBody(data));
  return response.data.data;
};

// Soft delete: the station stops being accepted by the backend.
export const deleteStationApi = async (id: string) => {
  const response = await api.delete(`${station_end_point}/${id}`);
  return response.data;
};
