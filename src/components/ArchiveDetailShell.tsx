import { useEffect, useState } from "react";
import { Archive, Check, Copy, Hash, ImageOff, Loader2, X, ZoomIn } from "lucide-react";
import { FormattedDateTime } from "./FormattedDateTime";

// Shared building blocks for the archive detail popups (item, student, teacher)

function useCopy() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = async (value?: string | null) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — ignore silently
    }
  };

  return { copied, copy };
}

function useEscape(handler: () => void) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handler();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handler]);
}

const overlayClass =
  "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200";
const panelClass =
  "relative w-full overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200";

type ArchiveDialogProps = {
  label: string;
  titleId: string;
  recordId?: string | null;
  recordIdLabel?: string;
  onClose: () => void;
  onEscape?: () => void;
  children: React.ReactNode;
};

export function ArchiveDialog({
  label,
  titleId,
  recordId,
  recordIdLabel = "Record ID",
  onClose,
  onEscape,
  children,
}: ArchiveDialogProps) {
  const { copied, copy } = useCopy();
  useEscape(onEscape ?? onClose);

  return (
    <div className={overlayClass} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${panelClass} flex max-h-[90vh] max-w-2xl flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            <Archive className="h-3 w-3 text-slate-400" />
            {label}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="scrollbar-thin flex-1 space-y-6 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-3">
          {recordId ? (
            <button
              type="button"
              onClick={() => copy(recordId)}
              title={`Copy ${recordIdLabel.toLowerCase()}`}
              className="group inline-flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-slate-500 transition-colors hover:bg-white hover:text-slate-700"
            >
              <Hash className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="shrink-0">{recordIdLabel}:</span>
              <span className="truncate font-mono">{recordId}</span>
              {copied ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function ArchiveLoading({ message }: { message: string }) {
  return (
    <div className={overlayClass}>
      <div className={`${panelClass} flex max-w-sm items-center justify-center gap-3 p-8`}>
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        <span className="text-sm text-slate-500">{message}</span>
      </div>
    </div>
  );
}

export function ArchiveError({ message, onClose }: { message: string; onClose: () => void }) {
  useEscape(onClose);

  return (
    <div className={overlayClass} onClick={onClose}>
      <div className={`${panelClass} max-w-sm p-6 text-center`} onClick={(e) => e.stopPropagation()}>
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <Archive className="h-5 w-5 text-slate-400" />
        </span>
        <h3 className="text-sm font-semibold text-slate-900">Unable to load details</h3>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/** Neutral banner stating when the record was archived */
export function ArchivedNotice({ archivedAt, subject }: { archivedAt?: string | null; subject: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
        <Archive className="h-4 w-4" />
      </span>
      <div className="min-w-0 text-sm">
        <p className="font-medium text-slate-900">This {subject} is archived</p>
        <p className="text-slate-500">
          {archivedAt ? `Archived on ${FormattedDateTime(archivedAt)}` : "Archive date not available"}
        </p>
      </div>
    </div>
  );
}

export function DetailHeader({
  titleId,
  title,
  subtitle,
  avatar,
  badges,
}: {
  titleId: string;
  title: string;
  subtitle?: React.ReactNode;
  avatar: React.ReactNode;
  badges?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        {avatar}
        <div className="min-w-0">
          <h2 id={titleId} className="truncate text-lg font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          {subtitle && <p className="truncate text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {badges && <div className="flex flex-wrap gap-1.5">{badges}</div>}
    </div>
  );
}

export function InitialsAvatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg font-semibold text-slate-500 ring-1 ring-inset ring-slate-200">
      {initials}
    </div>
  );
}

export function NeutralBadge({ icon: Icon, children }: { icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
      {Icon && <Icon className="h-3 w-3 text-slate-500" />}
      {children}
    </span>
  );
}

export function DetailSection({
  title,
  columns = 1,
  children,
}: {
  title: string;
  columns?: 1 | 2;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">{title}</h3>
      <div
        className={
          columns === 2
            ? "grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:grid-cols-2"
            : "divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200"
        }
      >
        {children}
      </div>
    </section>
  );
}

export function InfoRow({
  icon: Icon,
  label,
  value,
  href,
  mono = false,
  copyable = false,
  full = false,
}: {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
  href?: string;
  mono?: boolean;
  copyable?: boolean;
  full?: boolean;
}) {
  const { copied, copy } = useCopy();
  const hasValue = value !== null && value !== undefined && value !== "";

  return (
    <div className={`group flex items-center gap-3 bg-white px-4 py-3 transition-colors hover:bg-slate-50/70 ${full ? "col-span-full" : ""}`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        {hasValue ? (
          href ? (
            <a href={href} className="block truncate text-sm font-medium text-slate-900 hover:text-blue-600 hover:underline">
              {value}
            </a>
          ) : (
            <div className={`truncate text-sm font-medium text-slate-900 ${mono ? "font-mono" : ""}`}>{value}</div>
          )
        ) : (
          <p className="text-sm italic text-slate-400">Not provided</p>
        )}
      </div>
      {hasValue && copyable && typeof value === "string" && (
        <button
          type="button"
          onClick={() => copy(value)}
          title={`Copy ${label.toLowerCase()}`}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
            copied
              ? "bg-emerald-50 text-emerald-600"
              : "text-slate-400 opacity-0 hover:bg-white hover:text-slate-700 hover:shadow-sm focus:opacity-100 group-hover:opacity-100"
          }`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

export function ZoomableImage({
  src,
  alt,
  label,
  emptyLabel,
  className = "aspect-[1.6]",
  onZoom,
}: {
  src?: string | null;
  alt: string;
  label?: string;
  emptyLabel: string;
  className?: string;
  onZoom: (src: string) => void;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 ${className}`}>
        <ImageOff className="h-6 w-6" />
        <span className="text-xs font-medium">{emptyLabel}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onZoom(src)}
      className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 ${className}`}
    >
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {label && (
        <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm">
          {label}
        </span>
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition-colors group-hover:bg-slate-900/30">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-5 w-5" />
        </span>
      </span>
    </button>
  );
}

export function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className="relative w-full max-w-3xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg transition-colors hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
        <img src={src} alt={alt} className="max-h-[80vh] w-full rounded-2xl object-contain shadow-2xl" />
      </div>
    </div>
  );
}
