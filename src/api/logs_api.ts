import { api } from "./axios";
import type { AuditLogEntryDto } from "../@types/types";

// Team call: the PRD names audit_log but lists no route.
export const auditLogApi = async (): Promise<AuditLogEntryDto[]> => {
    const response = await api.get("/audit-log");
    return response.data.data;
};

export const auditLogByIdApi = async (id: string): Promise<AuditLogEntryDto> => {
    const response = await api.get(`/audit-log/${id}`);
    return response.data.data;
};

