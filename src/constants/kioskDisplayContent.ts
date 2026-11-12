export const KIOSK_DISPLAY_CONTENT = {
  eyebrow: "Counter",
  title: "Kiosk confirmation",
  back: "Counter Station",
  station: "Kiosk",
  allStations: "All counter kiosks",
  connection: {
    live: "Live",
    offline: "Offline",
  },
  loadError: "Couldn't reach the server. The kiosk view will update again once the connection is back.",
  idle: {
    title: "Ready",
    detail: "Tap the instructor's auth card to borrow, or scan a finger to return an item.",
  },
  ending: {
    title: "Session ended",
    checking: "Checking the result…",
    failed: "Couldn't read the final result. Check the kiosk LCD.",
  },
  expiresIn: (s: number) => `Expires in ${s}s`,
  backToIdle: (s: number) => `Back to ready in ${s}s`,
  sessionType: (type: string) => `${type} session`,
  fields: {
    instructor: "Instructor",
    student: "Student",
    asset: "Item",
    room: "Room",
    classLength: "Class length",
    station: "Kiosk",
  },
  classLength: (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h} h ${m} min` : `${h} h`;
  },
  photoAlt: "Checkout photo for this session",
  lcd: {
    title: "Kiosk LCD",
    caption: "Mirror of the 20×4 display at the counter.",
    ok: "OK",
    okHint: "Confirm",
    cancel: "X",
    cancelHint: "Cancel",
  },
  footerHint:
    "Keep this page open on the counter computer next to the kiosk. It follows the session the kiosk is running and shows how it ended for a few seconds.",
} as const;
