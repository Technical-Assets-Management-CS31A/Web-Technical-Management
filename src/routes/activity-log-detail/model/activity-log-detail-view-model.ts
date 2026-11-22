import { useParams, useRouter } from "@tanstack/react-router";
import { useAuditLogById } from "../../../hooks/logsHooks";

export const show = (value: unknown) =>
    value === null || value === undefined || value === "" ? "—" : typeof value === "object" ? JSON.stringify(value) : String(value);

export const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "Asia/Manila",
    }).format(d);
};

export const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Manila",
    }).format(d);
};

export const useActivityLogDetailViewModel = () => {
  const { id } = useParams({ strict: false }) as { id: string };
  const router = useRouter();
  const { data: log, isLoading, isError } = useAuditLogById(id);

  return {
    id,
    router,
    log,
    isLoading,
    isError,
  };
};

export type ActivityLogDetailViewModel = ReturnType<typeof useActivityLogDetailViewModel>;
