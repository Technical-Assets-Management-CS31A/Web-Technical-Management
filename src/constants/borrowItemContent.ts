export const BORROW_ITEM_CONTENT = {
  title: "Borrow Item",
  description:
    "Browse available items or submit a borrow request for technical equipment.",
  note: {
    prefix: "Items in",
    highlight: "Defective",
    suffix: "condition can't be borrowed.",
  },
  tabs: {
    guest: "Borrow as Guest",
    reserve: "Reserve as Guest",
  },
  returnModal: {
    title: "Return Item",
    instructions: {
      prefix: "Scan the",
      highlight: "item barcode",
      suffix:
        "to mark it as returned. The system will automatically find and update the active borrowed record. If the scanner cannot read the barcode, you may manually enter it below.",
    },
    placeholder: "Scan or enter item barcode (e.g., ITEM-SN-12345)",
    cancel: "Cancel",
    confirm: "Confirm Return",
    processing: "Processing...",
    barcodeRequired: "Please enter a barcode",
  },
  floatingMenu: {
    returnItem: "Return Item",
    quickActions: "Quick Actions",
  },
  toast: {
    returnedTitle: "Item Returned",
    returnedMessage: "Item returned successfully!",
    returnFailedTitle: "Return Failed",
    returnFailed: "Failed to return item",
  },
} as const;
