import { useRef } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useImportStudents } from "../hooks/userHooks";
import { showToast } from "./AppToast";
import { getErrorMessage } from "./form/FormKit";

// Roster import (POST /students:import). Columns: studentNo, firstName, lastName, sectionCode.
export default function ImportStudentsButton() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { mutate: importStudents, isPending } = useImportStudents();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    // Reset so picking the same file again still triggers onChange
    e.target.value = "";

    importStudents(form, {
      onSuccess: () => {
        showToast.success("Import Successful", "Roster imported successfully.");
      },
      onError: (error: unknown) => {
        showToast.error("Import Failed", getErrorMessage(error, "Roster import failed. Check the file's columns."));
      },
    });
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
        title="Import a roster file with columns studentNo, firstName, lastName, sectionCode"
        className="group inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-emerald-800 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100 transition-colors group-hover:bg-emerald-600 group-hover:text-white group-hover:ring-emerald-600">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
        </span>
        {isPending ? "Importing..." : "Import roster"}
        {!isPending && (
          <span className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 sm:inline">
            .csv
          </span>
        )}
      </button>
    </div>
  );
}
