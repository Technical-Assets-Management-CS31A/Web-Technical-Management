export const ARCHIVE_CONTENT = {
  title: "Deleted records",
  description:
    "Assets, accounts and students that were deleted. They keep their history and can be restored.",
  stats: {
    assets: { label: "Deleted assets", hint: "Removed from the asset list" },
    accounts: { label: "Deleted accounts", hint: "Can no longer sign in" },
    students: { label: "Deleted students", hint: "Removed from the roster" },
  },
  table: {
    title: (label: string) => `Deleted ${label}`,
    count: (count: number, label: string) =>
      `${count} ${count === 1 ? "record" : "records"} in deleted ${label}`,
  },
  searchPlaceholder: (label: string) => `Search deleted ${label}...`,
  tabs: {
    assets: "Assets",
    accounts: "Accounts",
    students: "Students",
  },
  headers: {
    assets: ["Asset", "Category", "Condition", "Deleted"],
    accounts: ["Person", "Email", "Role", "Status", "Deleted"],
    students: ["Student", "Section", "Status", "Deleted"],
  },
  rowActions: {
    restore: "Restore",
  },
  modal: {
    title: "Restore record",
    noun: {
      assets: "asset",
      accounts: "account",
      students: "student",
    },
  },
  empty: {
    title: (label: string) => `No deleted ${label}`,
    noRecords: (label: string) => `Deleted ${label} will appear here.`,
    noMatches: (label: string) => `No deleted ${label} match your search.`,
  },
  toast: {
    restored: "Record Restored",
    restoredMessage: "The record is active again.",
    restoreFailed: "Restore Failed",
  },
} as const;
