import { ArchiveRestore, Loader2 } from "lucide-react";

// Shared pieces for the "Show deleted" filter that replaced the Deleted records screen
// (soft-deleted master data: assets, accounts, students).

export function ShowDeletedToggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`inline-flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
        checked
          ? "border-amber-400 bg-amber-50 text-amber-800"
          : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"
      }`}
    >
      <ArchiveRestore className="h-4 w-4" />
      Show deleted
    </button>
  );
}

export function DeletedBadge() {
  return <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">Deleted</span>;
}

export function RestoreButton({
  onRestore,
  isRestoring = false,
  disabled = false,
}: {
  onRestore: () => void;
  isRestoring?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onRestore();
      }}
      disabled={disabled || isRestoring}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {isRestoring ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArchiveRestore className="h-3.5 w-3.5" />}
      Restore
    </button>
  );
}
