import { api } from "./axios";
import { fetchAllPages, toListQuery, toPaged, unwrap } from "./paging";
import type {
  AssetCategoryDto,
  AssetCategoryForm,
  AssetDto,
  AssetForm,
  AssetListParams,
  LedgerEntryDto,
  ListParams,
  Paged,
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

export const listAssetsApi = async (params: AssetListParams): Promise<Paged<AssetDto>> => {
  const response = await api.get(asset_end_point, { params: toListQuery(params) });
  return toPaged<AssetDto>(response.data, params);
};

/** Every asset matching the filters, fetched page by page (exports, pickers, duplicate checks). */
export const allAssetsApi = async (params: Omit<AssetListParams, "page" | "pageSize"> = {}): Promise<AssetDto[]> =>
  fetchAllPages(listAssetsApi, params);

export const getAssetApi = async (id: string): Promise<AssetDto> => {
  const response = await api.get(`${asset_end_point}/${id}`);
  return unwrap(response.data);
};

export const addAssetApi = async (data: AssetForm): Promise<AssetDto> => {
  const response = await api.post(asset_end_point, toAssetBody(data));
  return unwrap(response.data);
};

export const updateAssetApi = async ({ id, data }: { id: string; data: AssetForm }): Promise<AssetDto> => {
  const response = await api.put(`${asset_end_point}/${id}`, toAssetBody(data));
  return unwrap(response.data);
};

/**
 * The backend has no /assets/{id}/status route: status is set through PUT /assets/{id}, which replaces every
 * field (anything left out is cleared). So read the current asset and send it back with only the status changed.
 * The backend allows IN_STORAGE <-> MAINTENANCE <-> RETIRED here; other statuses belong to the loan flows.
 */
export const setAssetStatusApi = async ({ id, status }: { id: string; status: StaffAssetStatus }) => {
  const current = unwrap<Record<string, unknown>>((await api.get(`${asset_end_point}/${id}`)).data);
  const body = {
    assetCode: current.assetCode,
    name: current.name,
    categoryId: current.categoryId,
    type: current.type,
    brand: current.brand ?? null,
    model: current.model ?? null,
    serialNo: current.serialNo ?? null,
    rfidTagUid: current.rfidTagUid ?? null,
    homeRoomId: current.homeRoomId,
    status,
    condition: current.condition,
    replacementCost: current.replacementCost,
    acquiredAt: current.acquiredAt ?? null,
    notes: current.notes ?? null,
  };
  const response = await api.put(`${asset_end_point}/${id}`, body);
  return unwrap(response.data);
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

/** One row of GET /assets/{id}/history as the backend sends it (LoanEndpoints.HistoryItem). */
type HistoryItem = {
  at: string;
  kind: "LEDGER" | "SCAN" | "ANOMALY";
  event: string;
  loanId: string | null;
  loanNo: string | null;
  stationId: string | null;
  roomId: string | null;
  details: Record<string, unknown> | null;
};

const toLedgerEntry = (item: HistoryItem, index: number): LedgerEntryDto => ({
  id: `${item.kind}:${item.at}:${index}`,
  event: item.event as LedgerEntryDto["event"],
  loanId: item.loanId ?? "",
  asset: null as unknown as LedgerEntryDto["asset"],
  student: null,
  instructor: null,
  actor: null,
  actorStation: null,
  photoUrl: null,
  approvalDecidedAt: null,
  details: item.details,
  occurredAt: item.at,
});

/**
 * The backend returns { assetId, items: HistoryItem[] } mixing ledger rows, room scans and anomalies.
 * The timeline shows ledger events and anomalies; raw room scans are left out (a verified scan already
 * shows up as its ROOM_VERIFIED ledger row). A plain LedgerEntryDto[] is still accepted.
 */
export const assetHistoryApi = async (id: string): Promise<LedgerEntryDto[]> => {
  const response = await api.get(`${asset_end_point}/${id}/history`);
  const body = unwrap<unknown>(response.data);
  const rows = Array.isArray(body) ? body : ((body as { items?: unknown[] } | null)?.items ?? []);
  return rows.map((row, i) => {
    const item = row as HistoryItem & Partial<LedgerEntryDto>;
    return item.occurredAt ? (item as LedgerEntryDto) : item.kind === "SCAN" ? null : toLedgerEntry(item, i);
  }).filter((e): e is LedgerEntryDto => e !== null);
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

// The backend rejects pageSize > 100 (400), so walk the pages 100 at a time.
const categoryPage = async (params: Pick<ListParams, "page" | "pageSize">): Promise<Paged<AssetCategoryDto>> => {
  const response = await api.get(category_end_point, { params: { ...params, sort: "name" } });
  return toPaged<AssetCategoryDto>(response.data, params);
};

export const allCategoriesApi = (): Promise<AssetCategoryDto[]> => fetchAllPages(categoryPage, {});

export const addCategoryApi = async (data: AssetCategoryForm): Promise<AssetCategoryDto> => {
  const response = await api.post(category_end_point, data);
  return unwrap(response.data);
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

export const listRoomsApi = async (params: ListParams): Promise<Paged<RoomDto>> => {
  const response = await api.get("/rooms", { params: toListQuery(params) });
  return toPaged<RoomDto>(response.data, params);
};

/** Every room, fetched page by page so a paged response does not hide rooms. */
export const allRoomsApi = async (): Promise<RoomDto[]> => fetchAllPages(listRoomsApi, {});
