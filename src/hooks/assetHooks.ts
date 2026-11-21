import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AssetListParams } from "../@types/types";
import {
  addAssetApi,
  addCategoryApi,
  allAssetsApi,
  allCategoriesApi,
  allRoomsApi,
  assetHistoryApi,
  deleteAssetApi,
  deleteCategoryApi,
  getAssetApi,
  importAssetsApi,
  listAssetsApi,
  restoreAssetApi,
  setAssetStatusApi,
  updateAssetApi,
  updateCategoryApi,
} from "../api/asset_api";

export const ASSETS_KEY = ["assets"] as const;
export const CATEGORIES_KEY = ["asset-categories"] as const;
export const ROOMS_KEY = ["rooms"] as const;

const useInvalidateAssets = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ASSETS_KEY });
  };
};

// ── Assets ───────────────────────────────────────────────────────────────────

export const useAllAssets = (includeDeleted = false) => {
  return queryOptions({
    queryFn: () => allAssetsApi({ includeDeleted }),
    queryKey: [...ASSETS_KEY, { includeDeleted }],
    staleTime: 5 * 60 * 1000
  });
};

/** One page of assets for the Assets screen; keeps the previous page on screen while the next loads. */
export const useAssetPage = (params: AssetListParams) =>
  queryOptions({
    queryFn: () => listAssetsApi(params),
    queryKey: [...ASSETS_KEY, "page", params],
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

/** Every asset matching the server filters, for the client-side search and filters (FR-4.4). */
export const useFilteredAssets = (params: Omit<AssetListParams, "page" | "pageSize">, enabled = true) =>
  queryOptions({
    queryFn: () => allAssetsApi(params),
    queryKey: [...ASSETS_KEY, "all", params],
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    enabled,
  });

/**
 * Just the number of assets matching the filters (summary cards). GET /assets takes one status, so a list
 * of statuses is counted one status at a time and added up.
 */
export const useAssetCount = (params: Omit<AssetListParams, "page" | "pageSize"> = {}) =>
  queryOptions({
    queryFn: async () => {
      const statuses = Array.isArray(params.status) ? params.status : [params.status];
      const pages = await Promise.all(statuses.map((status) => listAssetsApi({ ...params, status, page: 1, pageSize: 1 })));
      return pages.reduce((sum, page) => sum + page.total, 0);
    },
    queryKey: [...ASSETS_KEY, "count", params],
    staleTime: 30 * 1000,
  });

export const useGetAsset = (id: string) => {
  return queryOptions({
    queryFn: () => getAssetApi(id),
    queryKey: [...ASSETS_KEY, id],
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAssetHistory = (id: string) => {
  return queryOptions({
    queryFn: () => assetHistoryApi(id),
    queryKey: [...ASSETS_KEY, id, "history"],
    enabled: !!id,
  });
};

export const useAddAsset = () => {
  const onSuccess = useInvalidateAssets();
  return useMutation({ mutationFn: addAssetApi, mutationKey: ["add-asset"], onSuccess });
};

export const useUpdateAsset = () => {
  const onSuccess = useInvalidateAssets();
  return useMutation({ mutationFn: updateAssetApi, mutationKey: ["update-asset"], onSuccess });
};

export const useSetAssetStatus = () => {
  const onSuccess = useInvalidateAssets();
  return useMutation({ mutationFn: setAssetStatusApi, mutationKey: ["asset-status"], onSuccess });
};

export const useDeleteAsset = () => {
  const onSuccess = useInvalidateAssets();
  return useMutation({ mutationFn: deleteAssetApi, mutationKey: ["delete-asset"], onSuccess });
};

export const useRestoreAsset = () => {
  const onSuccess = useInvalidateAssets();
  return useMutation({ mutationFn: restoreAssetApi, mutationKey: ["restore-asset"], onSuccess });
};

export const useImportAssets = () => {
  const onSuccess = useInvalidateAssets();
  return useMutation({ mutationFn: importAssetsApi, mutationKey: ["import-assets"], onSuccess });
};

// ── Categories ───────────────────────────────────────────────────────────────

export const useGetCategories = () =>
  queryOptions({
    queryKey: CATEGORIES_KEY,
    queryFn: allCategoriesApi,
    staleTime: 5 * 60 * 1000,
  });

const useInvalidateCategories = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
  };
};

export const useAddCategory = () => {
  const onSuccess = useInvalidateCategories();
  return useMutation({ mutationFn: addCategoryApi, onSuccess });
};

export const useUpdateCategory = () => {
  const onSuccess = useInvalidateCategories();
  return useMutation({ mutationFn: updateCategoryApi, onSuccess });
};

export const useDeleteCategory = () => {
  const onSuccess = useInvalidateCategories();
  return useMutation({ mutationFn: deleteCategoryApi, onSuccess });
};

// ── Rooms ────────────────────────────────────────────────────────────────────

export const useAllRooms = () =>
  queryOptions({
    queryKey: ROOMS_KEY,
    queryFn: allRoomsApi,
    staleTime: 5 * 60 * 1000,
  });
