import type { AnomalyStatus, AnomalyType } from "../@types/types";

export const ANOMALIES_CONTENT = {
  badge: "Operations",
  title: "Anomalies",
  description:
    "Wrong-room scans, unknown cards and late arrivals raised by the room stations. Acknowledge one when you start on it, then resolve it with a note.",
  types: {
    WRONG_ROOM: { label: "Wrong room", hint: "Tapped at a station other than its destination room" },
    UNBORROWED_TAP: { label: "Unknown card", hint: "Tag tapped at a room station with no active loan" },
    TRANSIT_TIMEOUT: { label: "Late arrival", hint: "Transit window expired without a valid room tap" },
  } satisfies Record<AnomalyType, { label: string; hint: string }>,
  statuses: {
    OPEN: "Open",
    ACKNOWLEDGED: "Acknowledged",
    RESOLVED: "Resolved",
  } satisfies Record<AnomalyStatus, string>,
  stats: {
    open: "Needs attention",
    openSub: (acknowledged: number) => `${acknowledged} acknowledged`,
  },
  views: [
    { value: "active", label: "Active queue" },
    { value: "resolved", label: "Resolved" },
  ],
  allTypes: "All types",
  tableTitle: (view: "active" | "resolved") => (view === "active" ? "Active queue" : "Resolved anomalies"),
  countLabel: (count: number) => `${count} anomal${count !== 1 ? "ies" : "y"}`,
  searchName: "Search anomalies",
  searchPlaceholder: "Search by asset, loan, room or station",
  activeHeaders: ["Type", "Asset", "Room / station", "Loan", "Detected", "Status"],
  resolvedHeaders: ["Type", "Asset", "Room / station", "Loan", "Resolved", "Note"],
  noLoan: "No loan",
  noRoom: "Unknown room",
  waiting: (age: string) => `${age} ago`,
  by: (name: string) => `by ${name}`,
  empty: {
    active: { title: "Queue is clear", description: "No open anomalies. New ones show up here as the stations raise them." },
    resolved: { title: "No resolved anomalies", description: "Try adjusting the type filter or search query." },
  },
  actions: {
    acknowledge: "Acknowledge",
    resolve: "Resolve",
  },
  resolveDialog: {
    title: "Resolve anomaly",
    subtitle: "The note and your name are stored with the anomaly, and it leaves the active queue.",
    confirm: "Resolve",
    fieldLabel: "Resolution note",
    hint: "Stored with the anomaly and your name",
    placeholder: "What did you find, and what was done?",
    error: "Give a note of at least 3 characters",
  },
  readOnly: "Only technical staff and admins can acknowledge or resolve anomalies.",
  toast: {
    acknowledged: "Anomaly Acknowledged",
    acknowledgedMessage: (assetCode: string) => `${assetCode} is marked as being handled.`,
    resolved: "Anomaly Resolved",
    resolvedMessage: (assetCode: string) => `${assetCode} has left the active queue.`,
    failed: "Anomaly Not Updated",
    failedMessage: "Failed to update the anomaly.",
  },
} as const;
