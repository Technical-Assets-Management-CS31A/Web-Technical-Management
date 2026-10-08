import { showToast } from "../components/AppToast";
import { useReturnItem } from "../hooks/itemHooks.ts";
import { Info, Loader2, RotateCcw, X } from "lucide-react";
import { GuestBorrowWizard } from "../components/GuestBorrowWizard";
import { BorrowDetailDialog } from "../components/BorrowDetailDialog";
import { useQueryClient } from "@tanstack/react-query";
import { useBorrowItemState } from "../states/borrow-item-state";
import { BORROW_ITEM_CONTENT as T } from "../constants/borrowItemContent";

export default function BorrowItem() {
  const {
    activeTab,
    setActiveTab,
    scannedLentItem,
    setScannedLentItem,
    showReturnModal,
    setShowReturnModal,
    returnBarcode,
    setReturnBarcode,
    returnError,
    setReturnError,
  } = useBorrowItemState();

  const queryClient = useQueryClient();
  const returnItemMutation = useReturnItem();

  const handleReturnSubmit = async () => {
    setReturnError("");
    const barcode = returnBarcode.trim();

    if (!barcode) {
      setReturnError(T.returnModal.barcodeRequired);
      return;
    }

    try {
      await returnItemMutation.mutateAsync(barcode);
      setShowReturnModal(false);
      setReturnBarcode("");
      setReturnError("");
      showToast.success(T.toast.returnedTitle, T.toast.returnedMessage);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : T.toast.returnFailed;
      showToast.error(T.toast.returnFailedTitle, msg);
      setShowReturnModal(false);
      setReturnBarcode("");
    }
  };

  const tabs = [
    { id: "guest" as const, label: T.tabs.guest },
    { id: "reserve" as const, label: T.tabs.reserve },
  ];

  const closeReturnModal = () => {
    setShowReturnModal(false);
    setReturnBarcode("");
    setReturnError("");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Return Item Modal */}
      {showReturnModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={closeReturnModal}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <RotateCcw className="h-4 w-4" />
                </span>
                <h2 className="text-base font-semibold text-slate-900">{T.returnModal.title}</h2>
              </div>
              <button
                onClick={closeReturnModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label={T.returnModal.cancel}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 p-5">
              <p className="text-sm leading-relaxed text-slate-500">
                {T.returnModal.instructions.prefix}{" "}
                <span className="font-medium text-slate-700">{T.returnModal.instructions.highlight}</span>{" "}
                {T.returnModal.instructions.suffix}
              </p>
              <div>
                <input
                  type="text"
                  autoFocus
                  value={returnBarcode}
                  onChange={(e) => {
                    setReturnBarcode(e.target.value);
                    setReturnError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleReturnSubmit();
                  }}
                  placeholder={T.returnModal.placeholder}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-4 ${
                    returnError
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/10"
                  }`}
                />
                {returnError && <p className="mt-1.5 text-sm text-rose-600">{returnError}</p>}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeReturnModal}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {T.returnModal.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleReturnSubmit}
                  disabled={returnItemMutation.isPending}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {returnItemMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {returnItemMutation.isPending ? T.returnModal.processing : T.returnModal.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8">

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{T.description}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowReturnModal(true)}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:self-auto"
          >
            <RotateCcw className="h-4 w-4 text-slate-500" />
            {T.floatingMenu.returnItem}
          </button>
        </header>

        {/* Tabs + note */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex self-start rounded-lg bg-slate-200/60 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Info className="h-4 w-4 shrink-0 text-amber-500" />
            <span>
              {T.note.prefix} <span className="font-medium text-slate-700">{T.note.highlight}</span> {T.note.suffix}
            </span>
          </p>
        </div>

        {/* Content */}
        <div className={activeTab === "guest" ? "" : "hidden"}>
          <GuestBorrowWizard
            mode="borrow"
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ["lentItems"] })}
          />
        </div>
        <div className={activeTab === "reserve" ? "" : "hidden"}>
          <GuestBorrowWizard
            mode="reserve"
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ["lentItems"] })}
          />
        </div>
      </div>

      {/* Scanned Lent Item Details Modal */}
      {scannedLentItem && (
        <BorrowDetailDialog
          lentItem={scannedLentItem}
          onClose={() => setScannedLentItem(null)}
          onReturnSuccess={() => {
            setScannedLentItem(null);
            showToast.success(T.toast.returnedTitle, T.toast.returnedMessage);
          }}
        />
      )}
    </div>
  );
}
