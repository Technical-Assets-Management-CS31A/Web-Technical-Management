export const USER_MANAGEMENT_CONTENT = {
  badge: "User directory",
  title: "User Management",
  description:
    "Manage all system users — staff accounts, teachers, and students — from one place.",
  tabs: {
    staff: "Staff & Admins",
    registered: "Teachers & Students",
  },
  newUser: "New User",
  stats: {
    total: "total",
    staff: "staff",
    admins: "admins",
    online: (count: number) => `(${count} online)`,
  },
  roleFilters: [
    { value: "all", label: "All" },
    { value: "admin", label: "Admin" },
    { value: "staff", label: "Staff" },
  ],
  searchName: "Search Users",
  searchPlaceholder: "Search by name, role, or status",
  empty: {
    title: "No users found",
    description: "Try adjusting your filters or search query, or add a new user.",
  },
  tableHeaders: ["First Name", "Last Name", "Username", "Email", "Role", "Status"],
  tip: {
    label: "Tip:",
    text: "Click any row to view user credentials. Use role and status filters to narrow results.",
  },
  archiveModal: {
    title: "Archive User",
    label: "archive",
    noun: "user",
    destination: "archive",
  },
  toast: {
    archivedTitle: "User Archived",
    actionFailed: "Action Failed",
    cannotArchiveSelf: "You cannot archive the logged-in user!",
    unblockedTitle: "User Unblocked",
    unblockedMessage: "User has been unblocked successfully.",
    unblockFailed: "Failed to unblock user.",
    blockedTitle: "User Blocked",
    blockedMessage: "User has been blocked successfully.",
    blockFailed: "Failed to block user.",
  },
} as const;
