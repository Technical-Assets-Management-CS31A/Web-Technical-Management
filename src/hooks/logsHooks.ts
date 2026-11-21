import { useQuery } from "@tanstack/react-query";
import { auditLogApi, auditLogByIdApi } from "../api/logs_api";


export const useAuditLog = () => {
    return useQuery({
        queryKey: ["audit-log"],
        queryFn: auditLogApi,
    });
};

export const useAuditLogById = (id: string) => {
    return useQuery({
        queryKey: ["audit-log", id],
        queryFn: () => auditLogByIdApi(id),
        enabled: !!id,
    });
};
