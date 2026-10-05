export const INVENTORY_LIST_CONTENT = {
  badge: "Asset management",
  title: "Inventory List",
  description:
    "Overview of assets and availability. Track counts by category, condition, and borrow status.",
  newItem: "New Item",
  moreOptions: "More options",
  menu: {
    import: "Import Items",
    importing: "Importing...",
    export: (count: number) => `Export Items${count > 0 ? ` (${count})` : ""}`,
    exporting: "Exporting...",
  },
  table: {
    title: "Items",
    count: (count: number) => `${count} item${count !== 1 ? "s" : ""}`,
    inCategory: (category: string) => ` in ${category}`,
    searchPlaceholder: "Search items...",
  },
  empty: {
    title: "No items found",
    description:
      "Try adjusting your search or filters. New items will appear here once created.",
    clearFilters: "Clear all filters",
  },
  printModal: {
    badge: "Barcode export",
    title: "Generate Barcode PDF",
    readyToExport: (count: number) => `${count} item${count !== 1 ? "s" : ""} ready to export`,
    previous: "Previous",
    next: "Next",
    pageOf: (page: number, total: number) => `Page ${page} of ${total}`,
    cancel: "Cancel",
  },
  exportSheetName: "Inventory Items",
  toast: {
    invalidFileTitle: "Invalid File",
    invalidFile: "Please upload a valid Excel file (.xlsx or .xls).",
    fileTooLargeTitle: "File Too Large",
    fileTooLarge: "File size must be under 5 MB.",
    importSuccessTitle: "Import Successful",
    importSuccess: "Items have been imported successfully.",
    importFailedTitle: "Import Failed",
    importFailed: "Please check your file format and try again.",
    nothingToExportTitle: "Nothing to Export",
    nothingToExport: "No items to export. Please add items to your inventory first.",
    exportSuccessTitle: "Export Successful",
    exportSuccess: (count: number, filename: string) =>
      `Exported ${count} item${count !== 1 ? "s" : ""} to ${filename}`,
    exportFailedTitle: "Export Failed",
    unknownError: "Unknown error",
  },
} as const;
