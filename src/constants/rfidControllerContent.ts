export const RFID_CONTROLLER_CONTENT = {
  eyebrow: "Counter",
  title: "Counter Station",
  description:
    "Follows the kiosk checkout at this counter. When the kiosk reaches the photo step, capture the borrower with the webcam and upload it.",
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
  capturePrompt: "Take the checkout photo",
  cameraIdle: "The camera opens when the kiosk asks for the photo.",
  photoReceived: "Checkout photo received.",
  upload: "Upload photo",
  error: "Couldn't load kiosk sessions. Check the connection to the server.",
  footerHint:
    "Card, fingerprint, item tag, photo and the instructor's approval on mobile must all pass. Any failed step denies the borrow.",
  toast: {
    uploadedTitle: "Photo Uploaded",
    uploaded: "The kiosk will now ask the instructor to approve.",
    failedTitle: "Upload Failed",
    failed: "Could not upload the photo. Try again.",
  },
} as const;
