import { api } from "./axios";
import type { SystemSettingDto } from "../@types/types";

// PRD 6.3: GET /settings and PUT /settings. The PRD gives no body shapes, so this follows
// SystemSettingDto (PRD 7): a list of { key, value } rows from system_settings.
const settings_end_point = "/settings";

export const getSettingsApi = async (): Promise<SystemSettingDto[]> => {
  const response = await api.get(settings_end_point);
  return response.data.data ?? [];
};

// Same list shape as the GET. Sends only the rows that changed; the backend upserts each key.
export const updateSettingsApi = async (settings: SystemSettingDto[]): Promise<SystemSettingDto[] | undefined> => {
  const response = await api.put(settings_end_point, settings);
  return response.data?.data;
};
