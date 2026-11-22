import { useState } from "react";
import { AlertTriangle, Loader2, RotateCw } from "lucide-react";
import { getErrorMessage } from "./form/FormKit";

type ErrorTableProps = {
  /** Short headline; defaults to a generic "couldn't load" line. */
  title?: string;
  /** The failed query's error: its server message is shown so the cause is visible. */
  error?: unknown;
  /** Re-runs just the failed request; without it the page reloads. */
  onRetry?: () => unknown;
};

// Inline empty-state for a section whose data failed to load. Neutral on purpose:
// it sits inside cards and panels, so it should not shout louder than the page around it.
export default function ErrorTable({ title = "Couldn't load this data", error, onRetry }: ErrorTableProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const detail = error ? getErrorMessage(error, "") : "";
  const status = (error as { response?: { status?: number } } | undefined)?.response?.status;

  const retry = async () => {
    if (!onRetry) {
      window.location.reload();
      return;
    }
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div role="alert" className="flex h-full w-full flex-col items-center justify-center px-6 py-10 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-inset ring-red-100">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Check your connection and try again. If it keeps happening, contact the system administrator.
      </p>
      {(detail || status) && (
        <p className="mt-3 max-w-sm rounded-md bg-slate-50 px-2.5 py-1 text-xs text-slate-500 ring-1 ring-inset ring-slate-200">
          {status ? <span className="font-medium text-slate-600">Error {status}</span> : null}
          {status && detail ? " · " : null}
          {detail}
        </p>
      )}
      <button
        type="button"
        onClick={retry}
        disabled={isRetrying}
        className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRetrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
        Try again
      </button>
    </div>
  );
}
