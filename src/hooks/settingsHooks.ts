import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettingsApi, updateSettingsApi } from "../api/settings_api";

export const SETTINGS_KEY = ["system-settings"] as const;

export const useSystemSettings = () =>
  queryOptions({
    queryKey: SETTINGS_KEY,
    queryFn: getSettingsApi,
    staleTime: 60 * 1000,
  });

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSettingsApi,
    mutationKey: ["update-settings"],
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEY }),
  });
};
