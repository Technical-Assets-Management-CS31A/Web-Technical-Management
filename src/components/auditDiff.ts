import type { AuditLogEntryDto } from "../@types/types";

// Field names whose values differ between an audit entry's before and after snapshots.
export const changedKeys = (entry: Pick<AuditLogEntryDto, "before" | "after">) => {
    const before = entry.before ?? {};
    const after = entry.after ?? {};
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    return [...keys].filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]));
};
