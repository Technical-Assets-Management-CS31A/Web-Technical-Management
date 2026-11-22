import { useEffect } from "react";
import { Archive, ArchiveRestore, Ban, X, Loader2, RotateCcw, Trash2 } from "lucide-react";

type PopUpModalProps = {
  title: string;
  label: string;
  noun: string;
  destination?: string;
  onHandleCancelAction: () => void;
  onHandleConfirmAction: () => void;
  isLoading?: boolean;
};

// The colour follows what the button does: destructive (delete, revoke) is red,
// restoring is green, and anything else that only sets something aside (archive) is amber.
const TONES = {
  danger: {
    iconTile: "bg-red-50 text-red-600 ring-red-100",
    highlight: "text-red-600",
    button: "bg-red-600 hover:bg-red-700 focus-visible:ring-red-200",
  },
  restore: {
    iconTile: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    highlight: "text-emerald-700",
    button: "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-200",
  },
  caution: {
    iconTile: "bg-amber-50 text-amber-600 ring-amber-100",
    highlight: "text-amber-700",
    button: "bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-200",
  },
};

const DANGER_ACTIONS = ["delete", "remove", "revoke", "deactivate"];

const toneFor = (label: string) => {
  const action = label.toLowerCase();
  if (action === "restore") return { ...TONES.restore, icon: ArchiveRestore };
  if (action === "revoke" || action === "deactivate") return { ...TONES.danger, icon: Ban };
  if (DANGER_ACTIONS.includes(action)) return { ...TONES.danger, icon: Trash2 };
  return { ...TONES.caution, icon: Archive };
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function PopUpModal({
  title,
  label,
  noun,
  destination,
  onHandleCancelAction,
  onHandleConfirmAction,
  isLoading = false,
}: PopUpModalProps) {
  // Close on Escape (ignored while the action is processing)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onHandleCancelAction();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLoading, onHandleCancelAction]);

  const tone = toneFor(label);
  const Icon = tone.icon;

  const handleCancel = () => {
    if (!isLoading) onHandleCancelAction();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="popup-modal-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          aria-label="Close"
          className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pb-6 pt-6">
          <span className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset ${tone.iconTile}`}>
            <Icon className="h-6 w-6" />
          </span>

          <h3 id="popup-modal-title" className="text-lg font-semibold tracking-tight text-slate-900">
            {title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            Are you sure you want to <span className={`font-semibold ${tone.highlight}`}>{label}</span> this{" "}
            <span className="font-semibold text-slate-700">{noun}</span>?
          </p>

          {destination && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
                <RotateCcw className="h-3.5 w-3.5" />
              </span>
              <div className="text-sm">
                <p className="font-medium text-slate-900">Reversible action</p>
                <p className="mt-0.5 text-slate-500">
                  You can undo this from the <span className="font-medium text-slate-700">{destination}</span>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
            Press
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-sans text-[10px] font-medium text-slate-500 shadow-sm">
              Esc
            </kbd>
            to cancel
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onHandleConfirmAction}
              disabled={isLoading}
              autoFocus
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-all focus:outline-none focus-visible:ring-4 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${tone.button}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Icon className="h-4 w-4" />
                  {capitalize(label)} {noun}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
