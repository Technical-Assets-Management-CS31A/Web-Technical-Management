import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Download, FileSpreadsheet, RotateCcw, Upload } from "lucide-react";
import type { RosterImportResult } from "../@types/types";
import { useAllSections, useImportStudents } from "../hooks/userHooks";
import { showToast } from "./AppToast";
import { FormAlert, FormDialog, FormSection, getErrorMessage } from "./form/FormKit";
import { ROSTER_COLUMNS, ROSTER_MAX_BYTES, parseRosterCsv, rosterTemplateCsv, type RosterCheck } from "./rosterCsv";

// Roster import (FR-9.3, POST /students:import): pick a CSV, check it here, upload it, read the report.

type ImportRosterDialogProps = { onClose: () => void };

const PREVIEW_ROWS = 5;
const ISSUE_ROWS = 50;

const readText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the file."));
    reader.readAsText(file);
  });

const downloadTemplate = () => {
  const url = URL.createObjectURL(new Blob([rosterTemplateCsv()], { type: "text/csv;charset=utf-8" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: "student-roster-template.csv" });
  link.click();
  URL.revokeObjectURL(url);
};

function IssueTable({ issues }: { issues: { line: number | null; studentNo?: string | null; message: string }[] }) {
  return (
    <div className="max-h-48 overflow-y-auto rounded-lg border border-rose-200">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 bg-rose-50 text-rose-700">
          <tr>
            <th className="px-3 py-2 font-medium">Line</th>
            <th className="px-3 py-2 font-medium">Student no.</th>
            <th className="px-3 py-2 font-medium">Problem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rose-100">
          {issues.slice(0, ISSUE_ROWS).map((issue, i) => (
            <tr key={`${issue.line}-${i}`}>
              <td className="px-3 py-1.5 tabular-nums text-slate-500">{issue.line ?? "—"}</td>
              <td className="px-3 py-1.5 font-mono text-slate-700">{issue.studentNo || "—"}</td>
              <td className="px-3 py-1.5 text-slate-700">{issue.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {issues.length > ISSUE_ROWS && (
        <p className="border-t border-rose-100 px-3 py-1.5 text-xs text-slate-500">…and {issues.length - ISSUE_ROWS} more</p>
      )}
    </div>
  );
}

export default function ImportRosterDialog({ onClose }: ImportRosterDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: sections = [] } = useQuery(useAllSections());
  const importStudents = useImportStudents();

  const [file, setFile] = useState<File | null>(null);
  const [check, setCheck] = useState<RosterCheck | null>(null);
  const [pickError, setPickError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<RosterImportResult | null>(null);

  const reset = () => {
    setFile(null);
    setCheck(null);
    setPickError("");
    setSubmitError("");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    reset();
    if (!/\.csv$/i.test(picked.name)) return setPickError("Choose a .csv file. In Excel or Sheets, use Save as / Download → CSV.");
    if (picked.size > ROSTER_MAX_BYTES) return setPickError("The file is over 5 MB. Split the roster into smaller files.");
    try {
      setCheck(parseRosterCsv(await readText(picked), sections));
      setFile(picked);
    } catch {
      setPickError("Could not read this file as CSV.");
    }
  };

  const canUpload = !!file && !!check && check.fileErrors.length === 0 && check.rowErrors.length === 0 && check.rows.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (result) return reset();
    if (!file || !canUpload) return;

    const form = new FormData();
    form.append("file", file);
    setSubmitError("");
    importStudents.mutate(form, {
      onSuccess: (report) => {
        setResult(report);
        if (report.errors.length) showToast.warning("Imported with problems", `${report.errors.length} row${report.errors.length === 1 ? "" : "s"} were not imported.`);
        else showToast.success("Roster Imported", `${file.name} was imported.`);
      },
      onError: (err) => {
        const message = getErrorMessage(err, "Roster import failed. Check the file's columns.");
        setSubmitError(message);
        showToast.error("Import Failed", message);
      },
    });
  };

  const counts = result && [
    { label: "Added", value: result.created },
    { label: "Updated", value: result.updated },
    { label: "Skipped", value: result.skipped },
    { label: "New sections", value: result.sectionsCreated },
  ].filter((c) => c.value !== null);

  return (
    <FormDialog
      title="Import student roster"
      subtitle={result ? "Import report" : "CSV with one student per row"}
      icon={FileSpreadsheet}
      size="lg"
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={importStudents.isPending}
      submitLabel={result ? "Import another file" : check?.rows.length ? `Import ${check.rows.length} student${check.rows.length === 1 ? "" : "s"}` : "Import"}
      submitIcon={result ? RotateCcw : Upload}
      submitDisabled={!result && !canUpload}
      cancelLabel={result ? "Done" : "Cancel"}
      footerNote={result ? undefined : "The file is checked here before anything is saved."}
    >
      <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handlePick} className="hidden" />

      {result ? (
        <>
          {counts && counts.length > 0 ? (
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {counts.map((c) => (
                <div key={c.label} className="rounded-lg border border-slate-200 px-3 py-2">
                  <dt className="text-xs text-slate-500">{c.label}</dt>
                  <dd className="text-xl font-semibold tabular-nums text-slate-900">{c.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <FormAlert tone="success">{file?.name} was uploaded.</FormAlert>
          )}
          {result.errors.length > 0 ? (
            <FormSection title={`${result.errors.length} row${result.errors.length === 1 ? "" : "s"} not imported`} columns={1}>
              <IssueTable issues={result.errors} />
            </FormSection>
          ) : (
            <FormAlert tone="success">Every row was imported. Enroll fingerprints at the kiosk so these students can borrow.</FormAlert>
          )}
        </>
      ) : (
        <>
          <FormSection title="File format" columns={1}>
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-600">
              <p>
                A header row with these columns, in any order:{" "}
                {ROSTER_COLUMNS.map((column, i) => (
                  <span key={column}>
                    <code className="rounded bg-white px-1 py-0.5 font-mono text-xs text-slate-800 ring-1 ring-slate-200">{column}</code>
                    {i < ROSTER_COLUMNS.length - 1 ? " " : ""}
                  </span>
                ))}
              </p>
              <p className="mt-1.5 text-xs text-slate-500">School year looks like 2026-2027. A section is its code plus school year, e.g. BSCS-2A in 2026-2027.</p>
              <button type="button" onClick={downloadTemplate} className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
                <Download className="h-3.5 w-3.5" /> Download template
              </button>
            </div>
          </FormSection>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-sm text-slate-600 transition-colors hover:border-blue-400 hover:bg-blue-50/40 hover:text-blue-700"
          >
            <FileSpreadsheet className="h-5 w-5" />
            {file ? <span><span className="font-medium">{file.name}</span> · choose a different file</span> : "Choose a CSV file"}
          </button>

          {pickError && <FormAlert tone="error">{pickError}</FormAlert>}

          {check && (
            <>
              {check.fileErrors.map((message) => (
                <FormAlert key={message} tone="error">{message}</FormAlert>
              ))}

              {check.fileErrors.length === 0 && check.rowErrors.length > 0 && (
                <FormSection
                  title={`${check.rowErrors.length} row${check.rowErrors.length === 1 ? "" : "s"} to fix before importing`}
                  description="Fix these in the file and choose it again."
                  columns={1}
                >
                  <IssueTable issues={check.rowErrors} />
                </FormSection>
              )}

              {check.newSections.length > 0 && (
                <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {check.newSections.length === 1 ? "This section is" : "These sections are"} not set up yet:{" "}
                    {check.newSections.map((s) => `${s.code} (${s.schoolYear})`).join(", ")}. Add {check.newSections.length === 1 ? "it" : "them"} under
                    Sections first if the import rejects those rows.
                  </span>
                </div>
              )}

              {canUpload && (
                <FormSection title={`Preview · ${check.rows.length} student${check.rows.length === 1 ? "" : "s"}`} columns={1}>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          {["Student no.", "First name", "Last name", "Section", "School year"].map((h) => (
                            <th key={h} className="px-3 py-2 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {check.rows.slice(0, PREVIEW_ROWS).map((row) => (
                          <tr key={row.line}>
                            <td className="px-3 py-1.5 font-mono">{row.studentNo}</td>
                            <td className="px-3 py-1.5">{row.firstName}</td>
                            <td className="px-3 py-1.5">{row.lastName}</td>
                            <td className="px-3 py-1.5">{row.sectionCode}</td>
                            <td className="px-3 py-1.5 tabular-nums">{row.schoolYear}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {check.rows.length > PREVIEW_ROWS && (
                      <p className="border-t border-slate-100 px-3 py-1.5 text-xs text-slate-500">…and {check.rows.length - PREVIEW_ROWS} more</p>
                    )}
                  </div>
                </FormSection>
              )}
            </>
          )}
        </>
      )}

      {submitError && <FormAlert tone="error">{submitError}</FormAlert>}
    </FormDialog>
  );
}
