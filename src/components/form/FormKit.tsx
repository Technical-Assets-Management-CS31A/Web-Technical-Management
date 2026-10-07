import { useEffect } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Loader2, Save, X } from "lucide-react";

// Shared building blocks for the edit forms (user, profile, teacher, student, item)

const SIZE = { md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-3xl" } as const;

type FormDialogProps = {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  size?: keyof typeof SIZE;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  /** Blocks closing (backdrop, Esc, X, Cancel) — e.g. while saving or an RFID scan is running */
  preventClose?: boolean;
  submitLabel?: string;
  submitDisabled?: boolean;
  submitTestId?: string;
  footerNote?: React.ReactNode;
  children: React.ReactNode;
};

export function FormDialog({
  title,
  subtitle,
  icon: Icon,
  size = "lg",
  onClose,
  onSubmit,
  isSubmitting = false,
  preventClose = false,
  submitLabel = "Save changes",
  submitDisabled = false,
  submitTestId,
  footerNote,
  children,
}: FormDialogProps) {
  const locked = isSubmitting || preventClose;

  const requestClose = () => {
    if (!locked) onClose();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !locked) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [locked, onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={requestClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-dialog-title"
        className={`relative flex max-h-[90vh] w-full ${SIZE[size]} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <h2 id="form-dialog-title" className="text-base font-semibold text-slate-900">{title}</h2>
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={locked}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-6 py-5">{children}</div>

          {/* Footer */}
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">{footerNote}</div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={requestClose}
                disabled={locked}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || submitDisabled}
                data-testid={submitTestId}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSubmitting ? "Saving..." : submitLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function FormSection({
  title,
  description,
  columns = 2,
  children,
}: {
  title: string;
  description?: string;
  columns?: 1 | 2 | 3;
  children: React.ReactNode;
}) {
  const grid = columns === 3 ? "sm:grid-cols-3" : columns === 2 ? "sm:grid-cols-2" : "";
  return (
    <section>
      <div className="mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      <div className={`grid grid-cols-1 gap-4 ${grid}`}>{children}</div>
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  required = false,
  optional = false,
  error,
  hint,
  className = "",
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-500">*</span>}
        {optional && <span className="text-xs font-normal text-slate-400">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

export const controlClass = (hasError = false) =>
  `h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
    hasError
      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
      : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500/10"
  }`;

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean };

const readOnlyClass = "cursor-not-allowed bg-slate-50! text-slate-500! shadow-none! hover:border-slate-200!";

export function TextInput({ error = false, className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      aria-invalid={error || undefined}
      className={`${controlClass(error)} ${props.readOnly ? readOnlyClass : ""} ${className}`}
    />
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean };

export function SelectInput({ error = false, className = "", children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        {...props}
        aria-invalid={error || undefined}
        className={`${controlClass(error)} appearance-none pr-9 ${className}`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

export function FormAlert({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  const isError = tone === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${
        isError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/** Pulls a readable message out of an axios / fetch error */
export function getErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string } | null;
  return err?.response?.data?.message || err?.message || fallback;
}
