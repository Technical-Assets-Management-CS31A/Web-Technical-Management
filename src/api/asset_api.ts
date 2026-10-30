import { api } from "./axios";
import type {
  AssetCategoryDto,
  AssetCategoryForm,
  AssetDto,
  AssetForm,
  LedgerEntryDto,
  RoomDto,
  StaffAssetStatus,
} from "../@types/types";

const asset_end_point = "/assets";
const category_end_point = "/asset-categories";

// Empty strings from the form become nulls in the request.
const toAssetBody = (data: AssetForm) => ({
  ...data,
  brand: data.brand || null,
  model: data.model || null,
  serialNo: data.serialNo || null,
  rfidTagUid: data.rfidTagUid ? data.rfidTagUid.replace(/[^0-9a-f]/gi, "").toUpperCase() : null,
  acquiredAt: data.acquiredAt || null,
  notes: data.notes || null,
});

// ── Assets ───────────────────────────────────────────────────────────────────

export const allAssetsApi = async ({ includeDeleted }: { includeDeleted?: boolean } = {}): Promise<AssetDto[]> => {
  const response = await api.get(asset_end_point, { params: { includeDeleted } });
  return response.data.data;
};

export const getAssetApi = async (id: string): Promise<AssetDto> => {
  const response = await api.get(`${asset_end_point}/${id}`);
  return response.data.data;
};

export const addAssetApi = async (data: AssetForm): Promise<AssetDto> => {
  const response = await api.post(asset_end_point, toAssetBody(data));
  return response.data.data;
};

export const updateAssetApi = async ({ id, data }: { id: string; data: AssetForm }): Promise<AssetDto> => {
  const response = await api.put(`${asset_end_point}/${id}`, toAssetBody(data));
  return response.data.data;
};

export const setAssetStatusApi = async ({ id, status }: { id: string; status: StaffAssetStatus }) => {
  const response = await api.put(`${asset_end_point}/${id}/status`, { status });
  return response.data;
};

// Soft delete: sets deletedAt.
export const deleteAssetApi = async (id: string) => {
  const response = await api.delete(`${asset_end_point}/${id}`);
  return response.data;
};

// Team call: restore is not in the PRD.
export const restoreAssetApi = async (id: string) => {
  const response = await api.post(`${asset_end_point}/${id}/restore`);
  return response.data;
};

export const assetHistoryApi = async (id: string): Promise<LedgerEntryDto[]> => {
  const response = await api.get(`${asset_end_point}/${id}/history`);
  return response.data.data;
};

// QR label image (tams:asset:<uuid>) for printing.
export const assetQrApi = async (id: string): Promise<Blob> => {
  const response = await api.get(`${asset_end_point}/${id}/qr`, { responseType: "blob" });
  return response.data;
};

export const importAssetsApi = async (formData: FormData) => {
  const response = await api.post(`${asset_end_point}:import`, formData);
  return response.data;
};

// ── Categories ───────────────────────────────────────────────────────────────

export const allCategoriesApi = async (): Promise<AssetCategoryDto[]> => {
  const response = await api.get(category_end_point);
  return response.data.data;
};

export const addCategoryApi = async (data: AssetCategoryForm): Promise<AssetCategoryDto> => {
  const response = await api.post(category_end_point, data);
  return response.data.data;
};

export const updateCategoryApi = async ({ id, data }: { id: string; data: AssetCategoryForm }) => {
  const response = await api.put(`${category_end_point}/${id}`, data);
  return response.data;
};

export const deleteCategoryApi = async (id: string) => {
  const response = await api.delete(`${category_end_point}/${id}`);
  return response.data;
};

// ── Rooms ────────────────────────────────────────────────────────────────────

export const allRoomsApi = async (): Promise<RoomDto[]> => {
  const response = await api.get("/rooms");
  return response.data.data;
};
