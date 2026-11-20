import { describe, expect, it } from "vitest";
import type { StudentDto, UserDto } from "../../@types/types";
import {
  frozenInstructorRows,
  hasActiveViolation,
  isStudentViolationFilter,
  isViolationsTab,
  matchesStudentFilter,
  studentViolationRows,
  summarizeViolations,
} from "../violations";

const student = (overrides: Partial<StudentDto> = {}): StudentDto => ({
  id: "s1",
  studentNo: "2024-0001",
  firstName: "Ana",
  lastName: "Reyes",
  section: { id: "sec1", code: "BSCS-2A", program: "BSCS", yearLevel: 2, schoolYear: "2026-2027" },
  standing: "GOOD",
  activeWarningCount: 0,
  activeMarkCount: 0,
  hasActiveHold: false,
  enrolledFingerCount: 1,
  status: "ACTIVE",
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
  deletedAt: null,
  ...overrides,
});

const instructor = (overrides: Partial<UserDto> = {}): UserDto => ({
  id: "u1",
  employeeNo: "EMP-001",
  firstName: "Ben",
  lastName: "Cruz",
  email: "ben@example.edu",
  role: "INSTRUCTOR",
  isEventCoordinator: false,
  defaultRoomId: null,
  status: "ACTIVE",
  isFrozen: true,
  activeFreeze: { id: "f1", instructorId: "u1", loanId: "l1", reason: null, status: "ACTIVE", frozenAt: "2026-11-10T00:00:00.000Z" },
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
  deletedAt: null,
  ...overrides,
});

describe("hasActiveViolation", () => {
  it("is false for a clean student and true once anything is active", () => {
    expect(hasActiveViolation(student())).toBe(false);
    expect(hasActiveViolation(student({ activeWarningCount: 1 }))).toBe(true);
    expect(hasActiveViolation(student({ activeMarkCount: 1 }))).toBe(true);
    expect(hasActiveViolation(student({ hasActiveHold: true }))).toBe(true);
    expect(hasActiveViolation(student({ standing: "WARNED" }))).toBe(true);
  });
});

describe("matchesStudentFilter", () => {
  const held = student({ hasActiveHold: true });
  it("narrows by kind", () => {
    expect(matchesStudentFilter(held, "holds")).toBe(true);
    expect(matchesStudentFilter(held, "marks")).toBe(false);
    expect(matchesStudentFilter(held, "warnings")).toBe(false);
    expect(matchesStudentFilter(held, "all")).toBe(true);
  });
});

describe("studentViolationRows", () => {
  const rows = [
    student({ id: "warned-only", firstName: "Zed", activeWarningCount: 2 }),
    student({ id: "clean" }),
    student({ id: "blocked", standing: "BLOCKED", activeMarkCount: 2 }),
    student({ id: "held", standing: "WARNED", activeMarkCount: 1, hasActiveHold: true }),
    student({ id: "marked", standing: "WARNED", activeMarkCount: 1 }),
    student({ id: "archived", activeWarningCount: 3, deletedAt: "2026-10-01T00:00:00.000Z" }),
  ];

  it("lists worst first and leaves out clean and archived students", () => {
    expect(studentViolationRows(rows, { filter: "all", q: "" }).map((s) => s.id)).toEqual(["blocked", "held", "marked", "warned-only"]);
  });

  it("applies the filter and search", () => {
    expect(studentViolationRows(rows, { filter: "warnings", q: "" }).map((s) => s.id)).toEqual(["warned-only"]);
    expect(studentViolationRows(rows, { filter: "all", q: "zed" }).map((s) => s.id)).toEqual(["warned-only"]);
    expect(studentViolationRows(rows, { filter: "all", q: "bscs-2a" })).toHaveLength(4);
  });
});

describe("frozenInstructorRows", () => {
  it("keeps frozen, live instructors, longest frozen first", () => {
    const users = [
      instructor({ id: "new", activeFreeze: { id: "f2", instructorId: "new", status: "ACTIVE", frozenAt: "2026-11-15T00:00:00.000Z" } }),
      instructor({ id: "old" }),
      instructor({ id: "free", isFrozen: false, activeFreeze: null }),
      instructor({ id: "gone", deletedAt: "2026-11-01T00:00:00.000Z" }),
      instructor({ id: "admin", role: "ADMIN" }),
    ];
    expect(frozenInstructorRows(users, "").map((u) => u.id)).toEqual(["old", "new"]);
    expect(frozenInstructorRows(users, "emp-001")).toHaveLength(2);
    expect(frozenInstructorRows(users, "nobody")).toHaveLength(0);
  });
});

describe("summarizeViolations", () => {
  it("adds up counts for live students and frozen instructors", () => {
    const summary = summarizeViolations(
      [
        student({ id: "a", activeWarningCount: 2 }),
        student({ id: "b", standing: "BLOCKED", activeMarkCount: 2, activeWarningCount: 1, hasActiveHold: true }),
        student({ id: "c" }),
        student({ id: "d", activeWarningCount: 5, deletedAt: "2026-10-01T00:00:00.000Z" }),
      ],
      [instructor(), instructor({ id: "u2", isFrozen: false })],
    );
    expect(summary).toMatchObject({ students: 2, warnings: 3, marks: 2, holds: 1, blocked: 1, frozen: 1, warnedStudents: 2 });
    expect(summary.byFilter).toEqual({ all: 2, warnings: 2, marks: 1, holds: 1 });
  });
});

describe("search param guards", () => {
  it("accepts only known values", () => {
    expect(isViolationsTab("instructors")).toBe(true);
    expect(isViolationsTab("loans")).toBe(false);
    expect(isStudentViolationFilter("holds")).toBe(true);
    expect(isStudentViolationFilter("freezes")).toBe(false);
  });
});
