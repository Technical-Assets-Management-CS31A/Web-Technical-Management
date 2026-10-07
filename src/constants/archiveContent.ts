export const ARCHIVE_CONTENT = {
  title: "Archive",
  description:
    "Review archived records. Restore them back to the system or permanently delete them.",
  stats: {
    items: { label: "Archived items", hint: "Removed from inventory" },
    users: { label: "Admin & staff", hint: "Archived accounts" },
    teachers: { label: "Teachers", hint: "Archived accounts" },
    students: { label: "Students", hint: "Archived accounts" },
  },
  table: {
    title: (label: string) => `Archived ${label}`,
    count: (count: number, label: string) =>
      `${count} ${count === 1 ? "record" : "records"} in archived ${label}`,
  },
  searchPlaceholder: (label: string) => `Search archived ${label}...`,
  tabs: {
    items: "Items",
    users: "Users",
    teachers: "Teachers",
    students: "Students",
  },
  headers: {
    items: ["Item", "Category", "Condition", "Archived"],
    users: ["User", "Username", "Email", "Phone", "Role", "Status"],
    teachers: ["Teacher", "Username", "Status"],
    students: ["Student", "Course", "Section", "Year", "Status"],
  },
  rowActions: {
    moreActions: "More actions",
    restoreItem: "Restore item",
    deleteItem: "Delete permanently",
    restoreUser: "Restore user",
    deleteUser: "Delete permanently",
  },
  empty: {
    title: (label: string) => `No archived ${label}`,
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
