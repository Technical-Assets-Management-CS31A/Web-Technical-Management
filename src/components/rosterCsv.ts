import * as XLSX from "xlsx";
import type { RosterRow, SectionDto } from "../@types/types";

// Reads a roster CSV in the browser before it is uploaded to POST /students:import (FR-9.3),
// so staff see missing columns, blank cells and duplicates before anything is saved.
// The upload itself is the original file; the backend stays the source of truth.

export const ROSTER_COLUMNS = ["studentNo", "firstName", "lastName", "sectionCode", "schoolYear"] as const;
type RosterColumn = (typeof ROSTER_COLUMNS)[number];

export const ROSTER_MAX_BYTES = 5 * 1024 * 1024;
const STUDENT_NO_MAX = 20;
const SCHOOL_YEAR = /^(\d{4})-(\d{4})$/;

// Header cells are matched loosely: "Student No.", "student_no" and "studentNo" all work.
const HEADER_ALIASES: Record<string, RosterColumn> = {
  studentno: "studentNo",
  studentnumber: "studentNo",
  firstname: "firstName",
  lastname: "lastName",
  surname: "lastName",
  sectioncode: "sectionCode",
  section: "sectionCode",
  schoolyear: "schoolYear",
  sy: "schoolYear",
};

const normalizeHeader = (cell: string) => HEADER_ALIASES[cell.toLowerCase().replace(/[^a-z]/g, "")];

export type RosterIssue = { line: number; studentNo: string; message: string };

export type RosterCheck = {
  /** Problems with the file as a whole (wrong columns, empty file) */
  fileErrors: string[];
  rows: RosterRow[];
  /** Rows that would fail; the upload is blocked until they are fixed */
  rowErrors: RosterIssue[];
  /** Section + school year pairs not in the sections list yet */
  newSections: { code: string; schoolYear: string; rows: number }[];
};

export const isValidSchoolYear = (value: string) => {
  const match = SCHOOL_YEAR.exec(value);
  return !!match && Number(match[2]) === Number(match[1]) + 1;
};

export const parseRosterCsv = (text: string, sections: SectionDto[]): RosterCheck => {
  // raw: keep every cell as text so student numbers like 00123 keep their zeros.
  const workbook = XLSX.read(text.replace(/^\uFEFF/, ""), { type: "string", raw: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const table = sheet
    ? (XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "", raw: false, blankrows: true }) as string[][])
    : [];

  const result: RosterCheck = { fileErrors: [], rows: [], rowErrors: [], newSections: [] };
  const [header = [], ...body] = table;

  const columnIndex = new Map<RosterColumn, number>();
  header.forEach((cell, index) => {
    const column = normalizeHeader(String(cell));
    if (column && !columnIndex.has(column)) columnIndex.set(column, index);
  });
  const missing = ROSTER_COLUMNS.filter((column) => !columnIndex.has(column));
  if (missing.length) {
    result.fileErrors.push(`Missing column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`);
    return result;
  }

  const cell = (row: string[], column: RosterColumn) => String(row[columnIndex.get(column)!] ?? "").trim();
  const known = new Set(sections.map((s) => `${s.code.toUpperCase()}|${s.schoolYear}`));
  const firstLine = new Map<string, number>();
  const unseen = new Map<string, { code: string; schoolYear: string; rows: number }>();

  body.forEach((raw, index) => {
    const line = index + 2;
    if (raw.every((value) => String(value).trim() === "")) return;

    const row: RosterRow = {
      line,
      studentNo: cell(raw, "studentNo"),
      firstName: cell(raw, "firstName"),
      lastName: cell(raw, "lastName"),
      sectionCode: cell(raw, "sectionCode").toUpperCase(),
      schoolYear: cell(raw, "schoolYear"),
    };
    result.rows.push(row);

    const problems: string[] = [];
    const blank = ROSTER_COLUMNS.filter((column) => !row[column]);
    if (blank.length) problems.push(`Missing ${blank.join(", ")}`);
    if (row.studentNo.length > STUDENT_NO_MAX) problems.push(`Student no. is longer than ${STUDENT_NO_MAX} characters`);
    if (row.schoolYear && !isValidSchoolYear(row.schoolYear)) problems.push("School year must look like 2026-2027");

    if (row.studentNo) {
      const earlier = firstLine.get(row.studentNo);
      if (earlier) problems.push(`Student no. repeats line ${earlier}`);
      else firstLine.set(row.studentNo, line);
    }

    if (problems.length) {
      result.rowErrors.push({ line, studentNo: row.studentNo, message: problems.join("; ") });
    } else if (!known.has(`${row.sectionCode}|${row.schoolYear}`)) {
      const key = `${row.sectionCode}|${row.schoolYear}`;
      const entry = unseen.get(key) ?? { code: row.sectionCode, schoolYear: row.schoolYear, rows: 0 };
      unseen.set(key, { ...entry, rows: entry.rows + 1 });
    }
  });

  if (result.rows.length === 0) result.fileErrors.push("The file has a header but no student rows.");
  result.newSections = [...unseen.values()];
  return result;
};

export const rosterTemplateCsv = () =>
  [ROSTER_COLUMNS.join(","), "2024-00123,Juan,Dela Cruz,BSCS-2A,2026-2027", "2024-00124,Maria,Santos,BSCS-2A,2026-2027"].join("\r\n") + "\r\n";

/** The school year that is running now; classes start in June. */
export const currentSchoolYear = (today = new Date()) => {
  const year = today.getFullYear();
  return today.getMonth() >= 5 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};
