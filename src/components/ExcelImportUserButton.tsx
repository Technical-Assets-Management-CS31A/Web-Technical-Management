import { useRef, useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
// import { usePostImportExcelUserMutation } from "../query/post/usePostImportUserMutation";
import { useImportUser } from "../hooks/userHooks";
import { showToast } from "./AppToast";

export default function ExcelImportUserButton() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileData, setFileData] = useState<File | null>(null);

  const { mutate: importUser, isPending } = useImportUser();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileData(file);
    console.log(fileData);

    const reader = new FileReader();

    reader.onload = (event) => {
      const arrayBuffer = event.target?.result;
      if (!arrayBuffer) return;

      const data = new Uint8Array(arrayBuffer as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      XLSX.utils.sheet_to_json(worksheet);
    };

    reader.readAsArrayBuffer(file);

    const form = new FormData();
    form.append("file", file);

    // Reset so picking the same file again still triggers onChange
    e.target.value = "";

    importUser(form, {
      onSuccess: () => {
        showToast.success("Import Successful", "Students imported successfully!");
      },
      onError: (error: unknown) => {
        if (error instanceof Error) {
          console.log(error.message);
        }
        showToast.error("Import Failed", "Excel import failed. Please check your file.");
      },
    });
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx,.xls"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
        title="Import students from an Excel file (.xlsx, .xls)"
        className="group inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-emerald-800 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100 transition-colors group-hover:bg-emerald-600 group-hover:text-white group-hover:ring-emerald-600">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
        </span>
        {isPending ? "Importing..." : "Import Students"}
        {!isPending && (
          <span className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 sm:inline">
            .xlsx
          </span>
        )}
      </button>
    </div>
  );
}
