export const RFID_CONTROLLER_CONTENT = {
  eyebrow: "RFID Station",
  title: "Scan Controller",
  description: "Start a session, then have the student tap their card or item tag on the RFID station.",
  station: {
    label: "Station status",
    idleTitle: "Ready to scan",
    idleDescription: "Choose a mode below to open a scan session.",
    activeTitle: (mode: string) => `${mode} session in progress`,
    activeDescription: "Waiting for the student to tap on the RFID station...",
    idleBadge: "Idle",
    activeBadge: "Listening",
  },
  modes: {
    borrow: {
      label: "Borrow",
      description: "Register a new borrow request from the RFID station.",
      cta: "Start borrow session",
      steps: ["Start the session", "Student taps their ID card", "Student taps the item tag"],
      outcome: "Request goes to pending approval",
    },
    return: {
      label: "Return",
      description: "Process an item being returned at the RFID station.",
      cta: "Start return session",
      steps: ["Start the session", "Student taps the item tag"],
      outcome: "Item is marked as returned",
    },
  },
  activeBadge: "Active",
  footerHint: "Each session expires after 5 minutes. Closing the session window cancels it.",
} as const;
