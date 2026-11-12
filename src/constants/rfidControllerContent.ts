export const RFID_CONTROLLER_CONTENT = {
  eyebrow: "Counter",
  title: "Counter Station",
  description:
    "Follows the kiosk checkout at this counter. The borrower's photo is taken automatically by the Counter webcam page at the photo step.",
  idleTitle: "No active kiosk session",
  idleDescription: "A session appears here when an instructor taps their card at the kiosk.",
  steps: {
    AWAITING_FINGERPRINT: "Fingerprint",
    AWAITING_ASSET: "Item tag",
    AWAITING_PHOTO: "Photo",
    AWAITING_APPROVAL: "Approval",
    AWAITING_CONFIRM: "Confirm",
  },
  fields: {
    instructor: "Instructor (card)",
    student: "Student",
    asset: "Asset",
    room: "Room",
  },
  openWebcam: "Open counter webcam",
  cameraIdle: "The photo is taken automatically at the photo step.",
  photoInProgress: "Taking the checkout photo…",
  photoAlt: "Checkout photo for this session",
  photoReceived: "Checkout photo received.",
  error: "Couldn't load kiosk sessions. Check the connection to the server.",
  footerHint:
    "Card, fingerprint, item tag, photo and the instructor's approval on mobile must all pass. Any failed step denies the borrow.",
} as const;
