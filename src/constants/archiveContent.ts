export const ARCHIVE_CONTENT = {
  badge: "Archive vault",
  title: "Archive",
  description: (label: string) =>
    `View and manage archived ${label}. Restore records back to the system or permanently delete them.`,
  archivedCount: (count: number, label: string) => `${count} archived ${label}`,
  searchPlaceholder: (label: string) => `Search archived ${label}...`,
  tabs: {
    items: "Items",
    users: "Users",
    teachers: "Teachers",
    students: "Students",
  },
  headers: {
    items: ["Serial No.", "Image", "Name", "Category", "Condition", "Archived At"],
    users: ["User ID", "Full Name", "Username", "Email", "Phone", "Role", "Status", ""],
    teachers: ["Teacher ID", "Full Name", "Username", "Role", "Status"],
    students: ["Student ID", "Full Name", "Course", "Section", "Year", "Role", "Status"],
  },
  userMenu: {
    moreActions: "More actions",
    restore: "Restore User",
    delete: "Delete User",
  },
  empty: {
    title: (label: string) => `No Archived ${label}`,
    noRecords: (label: string) => `When ${label} are archived, they will appear here.`,
    noMatches: (label: string) =>
      `No archived ${label} match your search. Try adjusting your query.`,
  },
  modals: {
    restoreItem: { title: "Restore Item", label: "restore", noun: "item", destination: "inventory list" },
    deleteItem: { title: "Delete Item", label: "delete" },
    restoreUser: { title: "Restore User", label: "restore", noun: "user", destination: "Registration Module" },
    deleteUser: { title: "Delete User", label: "delete" },
  },
  toast: {
    itemRestored: "Item Restored",
    itemDeleted: "Item Deleted",
    userRestored: "User Restored",
    userDeleted: "User Deleted",
  },
} as const;
