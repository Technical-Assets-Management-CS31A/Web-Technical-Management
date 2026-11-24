import { api } from "./axios";
import { toPaged, unwrap } from "./paging";
import type { AuditLogEntryDto } from "../@types/types";

// Team call: the PRD names audit_log but lists no route.
// GET /audit-log is paged ({ items, page, pageSize, total }, pageSize 1-100). The log page shows the newest 100.
export const auditLogApi = async (): Promise<AuditLogEntryDto[]> => {
    const params = { page: 1, pageSize: 100 };
    const response = await api.get("/audit-log", { params });
    return toPaged<AuditLogEntryDto>(response.data, params).items;
};

export const auditLogByIdApi = async (id: string): Promise<AuditLogEntryDto> => {
    const response = await api.get(`/audit-log/${id}`);
    return unwrap(response.data);
};

