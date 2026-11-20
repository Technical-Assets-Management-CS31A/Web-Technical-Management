import type { StudentDto, StudentStanding, UserDto } from "../@types/types";
import { fullName } from "./utils";

// Pure helpers for the violations screen (PRD FR-6.8, US-10). Kept out of the component so they can be unit tested.

export type ViolationsTab = "students" | "instructors";
export type StudentViolationFilter = "all" | "warnings" | "marks" | "holds";

export const VIOLATION_TABS: ViolationsTab[] = ["students", "instructors"];
export const STUDENT_VIOLATION_FILTERS: StudentViolationFilter[] = ["all", "warnings", "marks", "holds"];

export const isViolationsTab = (value: unknown): value is ViolationsTab => (VIOLATION_TABS as unknown[]).includes(value);
export const isStudentViolationFilter = (value: unknown): value is StudentViolationFilter =>
  (STUDENT_VIOLATION_FILTERS as unknown[]).includes(value);

/** A student belongs on the screen while anything is still active against them. */
export const hasActiveViolation = (student: StudentDto) =>
  student.activeWarningCount > 0 || student.activeMarkCount > 0 || student.hasActiveHold || student.standing !== "GOOD";

export const matchesStudentFilter = (student: StudentDto, filter: StudentViolationFilter) => {
  if (filter === "warnings") return student.activeWarningCount > 0;
  if (filter === "marks") return student.activeMarkCount > 0;
  if (filter === "holds") return student.hasActiveHold;
  return hasActiveViolation(student);
};

const includesTerm = (values: (string | null | undefined)[], term: string) => {
  const q = term.trim().toLowerCase();
  if (!q) return true;
  return values.some((value) => value?.toLowerCase().includes(q));
};

export const matchesStudentSearch = (student: StudentDto, term: string) =>
  includesTerm([student.studentNo, fullName(student), student.section?.code], term);

export const matchesInstructorSearch = (user: UserDto, term: string) =>
  includesTerm([user.employeeNo, fullName(user), user.email], term);

const STANDING_RANK: Record<StudentStanding, number> = { BLOCKED: 2, WARNED: 1, GOOD: 0 };

/**
 * Students with something active, worst first: blocked, then held, then by mark and warning counts.
 * Archived students are left out; their penalties no longer stop anyone borrowing.
 */
export const studentViolationRows = (
  students: readonly StudentDto[],
  { filter, q }: { filter: StudentViolationFilter; q: string },
): StudentDto[] =>
  students
    .filter((s) => !s.deletedAt && matchesStudentFilter(s, filter) && matchesStudentSearch(s, q))
    .sort(
      (a, b) =>
        (STANDING_RANK[b.standing] ?? 0) - (STANDING_RANK[a.standing] ?? 0) ||
        Number(b.hasActiveHold) - Number(a.hasActiveHold) ||
        b.activeMarkCount - a.activeMarkCount ||
        b.activeWarningCount - a.activeWarningCount ||
        fullName(a).localeCompare(fullName(b)),
    );

const time = (iso: string | null | undefined) => {
  const t = iso ? Date.parse(iso) : Number.NaN;
  return Number.isFinite(t) ? t : 0;
};

export const isFrozenInstructor = (user: UserDto) => user.role === "INSTRUCTOR" && !user.deletedAt && !!user.isFrozen;

/** Frozen instructors, longest frozen first. */
export const frozenInstructorRows = (users: readonly UserDto[], q: string): UserDto[] =>
  users
    .filter((u) => isFrozenInstructor(u) && matchesInstructorSearch(u, q))
    .sort((a, b) => time(a.activeFreeze?.frozenAt) - time(b.activeFreeze?.frozenAt) || fullName(a).localeCompare(fullName(b)));

export type ViolationSummary = {
  students: number;
  warnings: number;
  marks: number;
  holds: number;
  blocked: number;
  frozen: number;
  /** Students with at least one active warning: the ones a term reset touches. */
  warnedStudents: number;
  byFilter: Record<StudentViolationFilter, number>;
};

export const summarizeViolations = (students: readonly StudentDto[], users: readonly UserDto[]): ViolationSummary => {
  const live = students.filter((s) => !s.deletedAt);
  const summary: ViolationSummary = {
    students: 0,
    warnings: 0,
    marks: 0,
    holds: 0,
    blocked: 0,
    frozen: users.filter(isFrozenInstructor).length,
    warnedStudents: 0,
    byFilter: { all: 0, warnings: 0, marks: 0, holds: 0 },
  };
  for (const s of live) {
    summary.warnings += s.activeWarningCount;
    summary.marks += s.activeMarkCount;
    if (s.hasActiveHold) summary.holds += 1;
    if (s.standing === "BLOCKED") summary.blocked += 1;
    if (s.activeWarningCount > 0) summary.warnedStudents += 1;
    for (const filter of STUDENT_VIOLATION_FILTERS) if (matchesStudentFilter(s, filter)) summary.byFilter[filter] += 1;
  }
  summary.students = summary.byFilter.all;
  return summary;
};
