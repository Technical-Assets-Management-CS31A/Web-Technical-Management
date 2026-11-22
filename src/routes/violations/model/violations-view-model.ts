import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { StudentDto } from "../../../@types/types";
import { useAllStudents, useAllUsers, useResetTermWarnings } from "../../../hooks/userHooks";
import { type PenaltyTarget } from "../../../components/PenaltyResolveDialog";
import { showToast } from "../../../components/AppToast";
import { frozenInstructorRows, studentViolationRows, summarizeViolations, type StudentViolationFilter, type ViolationsTab } from "../../../lib/violations";
import { UserData, canResetTermWarnings, canResolvePenalties } from "../../../utils/usersData/userData";
import { VIOLATIONS_CONTENT as T } from "../../../constants/violationsContent";

export const php = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

export type PenaltyItem = {
  key: string;
  title: string;
  detail: string;
  active: boolean;
  loanId?: string | null;
  action?: { label: string; target: Omit<PenaltyTarget, "subject"> };
};

export const useViolationsViewModel = () => {
  const viewer = UserData();
  const canResolve = canResolvePenalties(viewer.role);
  const canReset = canResetTermWarnings(viewer.role);
  const navigate = useNavigate();
  const params = useSearch({ strict: false }) as { tab?: ViolationsTab; filter?: StudentViolationFilter };
  const tab: ViolationsTab = params.tab ?? "students";
  const filter: StudentViolationFilter = params.filter ?? "all";

  const studentsQuery = useQuery(useAllStudents());
  const usersQuery = useQuery(useAllUsers());
  const resetTerm = useResetTermWarnings();

  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [target, setTarget] = useState<PenaltyTarget | null>(null);
  const [profile, setProfile] = useState<StudentDto | null>(null);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const students = useMemo(() => studentsQuery.data ?? [], [studentsQuery.data]);
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const summary = useMemo(() => summarizeViolations(students, users), [students, users]);
  const studentRows = useMemo(() => studentViolationRows(students, { filter, q: search }), [students, filter, search]);
  const instructorRows = useMemo(() => frozenInstructorRows(users, search), [users, search]);

  const setSearchParams = (next: { tab?: ViolationsTab; filter?: StudentViolationFilter }) => {
    const merged = { tab, filter, ...next };
    setExpandedId(null);
    // The search box remounts per tab (key={tab}), so its text is dropped with it.
    if (merged.tab !== tab) setSearch("");
    navigate({
      to: "/home/violations",
      search: {
        ...(merged.tab !== "students" ? { tab: merged.tab } : {}),
        ...(merged.tab === "students" && merged.filter !== "all" ? { filter: merged.filter } : {}),
      },
      replace: true,
    });
  };

  const onReset = (reason: string) => {
    resetTerm.mutate(
      { reason },
      {
        onSuccess: () => {
          setIsResetOpen(false);
          showToast.success(T.resetTerm.success, T.resetTerm.successMessage);
        },
      },
    );
  };

  return {
    viewer,
    canResolve,
    canReset,
    navigate,
    params,
    tab,
    filter,
    studentsQuery,
    usersQuery,
    resetTerm,
    search,
    setSearch,
    expandedId,
    setExpandedId,
    target,
    setTarget,
    profile,
    setProfile,
    isResetOpen,
    setIsResetOpen,
    students,
    users,
    summary,
    studentRows,
    instructorRows,
    setSearchParams,
    onReset,
  };
};

export type ViolationsViewModel = ReturnType<typeof useViolationsViewModel>;
