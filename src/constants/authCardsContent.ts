export const AUTH_CARDS_CONTENT = {
  badge: "Access",
  title: "Authorization cards",
  description:
    "Instructor RFID cards. An instructor taps their card at the counter kiosk to authorize a student's checkout.",
  newCard: "Register card",
  stats: {
    active: "Active cards",
    lost: "Lost",
    revoked: "Revoked",
    noCard: "Instructors without a card",
    activeSub: (count: number) => `Across ${count} instructor${count !== 1 ? "s" : ""}`,
    lostSub: "Can be marked found",
    revokedSub: "Permanently disabled",
    noCardSub: "Cannot authorize checkouts",
  },
  statusFilters: [
    { value: "all", label: "All" },
    { value: "ACTIVE", label: "Active" },
    { value: "LOST", label: "Lost" },
    { value: "REVOKED", label: "Revoked" },
  ],
  tableTitle: "Cards",
  countLabel: (count: number) => `${count} card${count !== 1 ? "s" : ""}`,
  searchName: "Search cards",
  searchPlaceholder: "Search by card UID, instructor or employee no.",
  empty: {
    title: "No cards found",
    description: "Try adjusting your filters or search query, or register a card.",
  },
  tableHeaders: ["Card UID", "Instructor", "Status", "Issued"],
  withoutCard: {
    title: "Instructors without an active card",
    register: "Register",
  },
  actions: {
    lost: "Mark lost",
    found: "Mark found",
    revoke: "Revoke",
  },
  revokeModal: { title: "Revoke Card", label: "revoke", noun: "card" },
  readOnly: "Only admins can register or change cards.",
  toast: {
    updated: "Card Updated",
    updatedMessage: (uid: string, status: string) => `Card ${uid} is now ${status.toLowerCase()}.`,
    failed: "Card Not Updated",
    failedMessage: "Failed to update card.",
  },
} as const;
