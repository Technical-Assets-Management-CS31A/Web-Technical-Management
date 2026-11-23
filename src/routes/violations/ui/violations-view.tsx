import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ChevronDown, CircleCheck, Info, Lock, RotateCcw, Search, ShieldX, Snowflake, Timer, type LucideIcon } from "lucide-react";
import type { StudentDto, UserDto } from "../../../@types/types";
import { useStudentStanding } from "../../../hooks/userHooks";
import SearchBar from "../../../components/SearchBar";
import ErrorTable from "../../../components/ErrorTables";
import ReasonDialog from "../../../components/ReasonDialog";
import StandingPill from "../../../components/StandingPill";
import ViewStudentCredentials from "../../../components/ViewStudentCredentials";
import PenaltyResolveDialog, { type PenaltyTarget } from "../../../components/PenaltyResolveDialog";
import { getErrorMessage } from "../../../components/form/FormKit";
import { FormattedDateTime } from "../../../components/FormattedDateTime";
import { UserSkeletonLoader } from "../../../components/UserSkeletonLoader";
import { fullName } from "../../../lib/utils";
import { STUDENT_VIOLATION_FILTERS, VIOLATION_TABS } from "../../../lib/violations";
import { VIOLATIONS_CONTENT as T } from "../../../constants/violationsContent";
import { php, type PenaltyItem, type ViolationsViewModel } from "../model/violations-view-model";

export default function ViolationsView(vm: ViolationsViewModel) {
  const {
    canResolve,
    canReset,
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
    summary,
    studentRows,
    instructorRows,
    setSearchParams,
    onReset,
  } = vm;

  if (studentsQuery.isPending || usersQuery.isPending) {
    return (
      <UserSkeletonLoader
        action={canReset ? "outline" : false}
        tabs={false}
        toolbar="segmented"
        filters={[300]}
        columns={["expand", "stack", "mono", "pill", "count", "count", "pill"]}
      />
    );
  }

  const stats: { label: string; value: number; sub: string; icon: LucideIcon; tone: string }[] = [
    { label: T.stats.students, value: summary.students, sub: T.stats.studentsSub(summary.blocked), icon: ShieldX, tone: "bg-rose-50 text-rose-600" },
    { label: T.stats.warnings, value: summary.warnings, sub: T.stats.warningsSub(summary.warnedStudents), icon: Timer, tone: "bg-amber-50 text-amber-600" },
    { label: T.stats.holds, value: summary.holds, sub: T.stats.holdsSub(summary.marks), icon: Lock, tone: "bg-slate-100 text-slate-500" },
    { label: T.stats.frozen, value: summary.frozen, sub: T.stats.frozenSub, icon: Snowflake, tone: "bg-sky-50 text-sky-600" },
  ];

  const current = tab === "students" ? studentsQuery : usersQuery;
  const rowCount = tab === "students" ? studentRows.length : instructorRows.length;
  const isFiltered = !!search.trim() || (tab === "students" && filter !== "all");
  const empty = isFiltered ? T.empty.filtered : T.empty[tab];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">

        {/* Header */}
        <header className="mt-12 flex flex-col gap-4 md:mt-0 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">{T.badge}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">{T.description}</p>
          </div>
          {canReset && (
            <button
              type="button"
              onClick={() => {
                resetTerm.reset();
                setIsResetOpen(true);
              }}
              className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 md:self-auto"
            >
              <RotateCcw className="h-4 w-4 text-slate-500" />
              {T.resetTerm.button}
            </button>
          )}
        </header>

        {/* Summary */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm">
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-500">{stat.label}</p>
                <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{stat.value}</p>
                <p className="mt-0.5 truncate text-xs text-slate-400" title={stat.sub}>{stat.sub}</p>
              </div>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.tone}`}>
                <stat.icon className="h-5 w-5" />
              </span>
            </div>
          ))}
        </section>

        {/* List */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex shrink-0 rounded-lg bg-slate-100 p-1">
                {VIOLATION_TABS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSearchParams({ tab: value })}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      tab === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {T.tabs[value]}
                    <span className="ml-1.5 tabular-nums text-slate-400">{value === "students" ? summary.students : summary.frozen}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">{T.countLabel(rowCount, tab)}</p>
            </div>

            <div className="flex flex-col flex-wrap items-stretch gap-2 sm:flex-row sm:items-center xl:justify-end">
              {tab === "students" && (
                <div className="inline-flex shrink-0 flex-wrap rounded-lg bg-slate-100 p-1">
                  {STUDENT_VIOLATION_FILTERS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSearchParams({ filter: value })}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                        filter === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {T.filters[value]}
                      <span className="ml-1.5 tabular-nums text-slate-400">{summary.byFilter[value]}</span>
                    </button>
                  ))}
                </div>
              )}
              <SearchBar key={tab} onChangeValue={setSearch} name={T.searchName} placeholder={T.searchPlaceholder[tab]} />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="max-h-[65vh] min-h-[45vh] overflow-y-auto">
              {current.isError ? (
                <ErrorTable error={current.error} onRetry={() => current.refetch()} />
              ) : rowCount === 0 ? (
                <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    {isFiltered ? <Search className="h-5 w-5 text-slate-400" /> : <CircleCheck className="h-5 w-5 text-emerald-500" />}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">{empty.title}</h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">{empty.description}</p>
                </div>
              ) : tab === "students" ? (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="sticky top-0 z-10 bg-slate-50">
                      <th className="w-10 border-b border-slate-200 py-3 pl-5" />
                      {T.studentHeaders.map((col) => (
                        <th key={col} className="border-b border-slate-200 px-5 py-3 font-medium text-slate-500">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentRows.map((student) => {
                      const isOpen = expandedId === student.id;
                      return (
                        <Fragment key={student.id}>
                          <tr
                            className={`cursor-pointer ${isOpen ? "bg-slate-50" : "hover:bg-slate-50"}`}
                            onClick={() => setExpandedId(isOpen ? null : student.id)}
                          >
                            <td className="py-3 pl-5">
                              <button
                                type="button"
                                aria-expanded={isOpen}
                                aria-label={isOpen ? T.collapse : T.expand}
                                className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200/60 hover:text-slate-600"
                              >
                                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                              </button>
                            </td>
                            <td className="px-5 py-3">
                              <p className="font-medium text-slate-900">{fullName(student)}</p>
                              <p className="font-mono text-xs text-slate-500">{student.studentNo}</p>
                            </td>
                            <td className="px-5 py-3 text-slate-700">{student.section?.code ?? "—"}</td>
                            <td className="px-5 py-3"><StandingPill standing={student.standing} /></td>
                            <td className="px-5 py-3"><CountCell value={student.activeWarningCount} tone="text-amber-700" /></td>
                            <td className="px-5 py-3"><CountCell value={student.activeMarkCount} tone="text-rose-700" /></td>
                            <td className="px-5 py-3">
                              {student.hasActiveHold ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                  <Lock className="h-3 w-3" />
                                  {T.detail.hold}
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          </tr>
                          {isOpen && (
                            <tr className="bg-slate-50">
                              <td colSpan={T.studentHeaders.length + 1} className="px-5 pb-5 pt-1 whitespace-normal">
                                <StudentPenalties
                                  student={student}
                                  canResolve={canResolve}
                                  onResolve={(t) => setTarget({ ...t, subject: fullName(student) })}
                                  onOpenProfile={() => setProfile(student)}
                                />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="sticky top-0 z-10 bg-slate-50">
                      {T.instructorHeaders.map((col) => (
                        <th key={col} className="border-b border-slate-200 px-5 py-3 font-medium text-slate-500">{col}</th>
                      ))}
                      {canResolve && <th className="border-b border-slate-200 px-5 py-3" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {instructorRows.map((user) => (
                      <InstructorRow
                        key={user.id}
                        user={user}
                        canResolve={canResolve}
                        onLift={(freezeId) => setTarget({ kind: "freeze", id: freezeId, label: "Approval freeze", subject: fullName(user) })}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {!canResolve && (
            <p className="flex items-start gap-2 border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
              <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>{T.readOnly}</span>
            </p>
          )}
        </section>
      </div>

      {target && <PenaltyResolveDialog target={target} onClose={() => setTarget(null)} />}

      {profile && <ViewStudentCredentials student={profile} isOpen onClose={() => setProfile(null)} />}

      {isResetOpen && (
        <ReasonDialog
          title={T.resetTerm.title}
          subtitle={T.resetTerm.subtitle}
          confirmLabel={T.resetTerm.confirm}
          tone="danger"
          fieldLabel={T.resetTerm.fieldLabel}
          placeholder={T.resetTerm.placeholder}
          isSubmitting={resetTerm.isPending}
          error={resetTerm.isError ? getErrorMessage(resetTerm.error, T.resetTerm.failedMessage) : undefined}
          onClose={() => setIsResetOpen(false)}
          onConfirm={onReset}
        >
          <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
            <p className="flex items-start gap-2 font-medium">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {T.resetTerm.summary(summary.warnings, summary.warnedStudents)}
            </p>
            <p className="pl-6 text-amber-800/80">{T.resetTerm.keeps}</p>
          </div>
        </ReasonDialog>
      )}
    </div>
  );
}

function CountCell({ value, tone }: { value: number; tone: string }) {
  return value > 0 ? <span className={`font-semibold tabular-nums ${tone}`}>{value}</span> : <span className="text-slate-300">0</span>;
}

function InstructorRow({ user, canResolve, onLift }: { user: UserDto; canResolve: boolean; onLift: (freezeId: string) => void }) {
  const freeze = user.activeFreeze;
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-5 py-3">
        <span className="inline-flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <Snowflake className="h-4 w-4" />
          </span>
          <span>
            <span className="block font-medium text-slate-900">{fullName(user)}</span>
            <span className="block text-xs text-slate-500">{user.email}</span>
          </span>
        </span>
      </td>
      <td className="px-5 py-3 font-mono text-xs text-slate-700">{user.employeeNo}</td>
      <td className="px-5 py-3 text-slate-700">{freeze?.frozenAt ? FormattedDateTime(freeze.frozenAt) : "—"}</td>
      <td className="max-w-[320px] whitespace-normal px-5 py-3 text-slate-600">{freeze?.reason || T.noReason}</td>
      <td className="px-5 py-3">
        {freeze?.loanId ? (
          <Link to="/home/loans/$loanId" params={{ loanId: freeze.loanId }} className="text-xs font-medium text-blue-600 hover:underline">
            {T.actions.viewLoan}
          </Link>
        ) : (
          <span className="text-xs text-slate-400">{T.noLoan}</span>
        )}
      </td>
      {canResolve && (
        <td className="px-5 py-3 text-right">
          {freeze && (
            <button
              type="button"
              onClick={() => onLift(freeze.id)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-sky-700 hover:bg-sky-50"
            >
              {T.actions.liftFreeze}
            </button>
          )}
        </td>
      )}
    </tr>
  );
}

/** One student's penalties from GET /students/{id}/standing, grouped by kind. */
function StudentPenalties({
  student,
  canResolve,
  onResolve,
  onOpenProfile,
}: {
  student: StudentDto;
  canResolve: boolean;
  onResolve: (target: Omit<PenaltyTarget, "subject">) => void;
  onOpenProfile: () => void;
}) {
  const { data: standing, isPending, isError } = useQuery(useStudentStanding(student.id));
  const [showCleared, setShowCleared] = useState(false);

  if (isPending) return <p className="py-4 text-sm text-slate-400">{T.detail.loading}</p>;
  if (isError || !standing) return <p className="py-4 text-sm text-rose-600">{T.detail.error}</p>;

  const groups: { title: string; items: PenaltyItem[] }[] = [
    {
      title: T.detail.warnings,
      items: standing.warnings.map((w) => ({
        key: w.id,
        title: `${T.detail.warning(w.warningNo)}${w.triggeredPenalty ? ` · ${T.detail.triggeredMark}` : ""}`,
        detail: `${w.schoolTerm} · ${T.detail.issued(FormattedDateTime(w.issuedAt) ?? "")}`,
        active: w.status === "ACTIVE",
        loanId: w.loanId,
        action: { label: T.actions.clear, target: { kind: "warning", id: w.id, label: T.detail.warning(w.warningNo) } },
      })),
    },
    {
      title: T.detail.marks,
      items: standing.marks.map((m) => ({
        key: m.id,
        title: T.detail.markReason[m.reason] ?? m.reason,
        detail: T.detail.issued(FormattedDateTime(m.issuedAt) ?? ""),
        active: m.status === "ACTIVE",
        loanId: m.loanId,
        action: { label: T.actions.clear, target: { kind: "mark", id: m.id, label: `${T.detail.markReason[m.reason] ?? m.reason} mark` } },
      })),
    },
    {
      title: T.detail.holds,
      items: standing.holds.map((h) => ({
        key: h.id,
        title: T.detail.hold,
        detail: T.detail.placed(FormattedDateTime(h.placedAt) ?? ""),
        active: h.status === "ACTIVE",
        loanId: h.loanId,
        action: { label: T.actions.lift, target: { kind: "hold", id: h.id, label: T.detail.hold } },
      })),
    },
    {
      title: T.detail.liabilities,
      items: standing.liabilities.map((l) => ({
        key: l.id,
        title: php.format(l.amount),
        detail: [T.detail.liabilityStatus[l.status] ?? l.status, l.receiptNo && T.detail.receipt(l.receiptNo)].filter(Boolean).join(" · "),
        active: l.status === "OUTSTANDING",
        loanId: l.loanId,
        action: { label: T.actions.settle, target: { kind: "liability", id: l.id, label: `Liability ${php.format(l.amount)}` } },
      })),
    },
  ];

  const clearedCount = groups.reduce((n, g) => n + g.items.filter((i) => !i.active).length, 0);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {groups.map((group) => {
          const items = group.items.filter((i) => i.active || showCleared);
          return (
            <div key={group.title} className="min-w-0">
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">{group.title}</h4>
              {items.length === 0 ? (
                <p className="text-sm italic text-slate-400">{T.detail.none}</p>
              ) : (
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
                  {items.map((item) => (
                    <li key={item.key} className="flex items-center gap-2 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-medium ${item.active ? "text-slate-900" : "text-slate-400 line-through"}`}>{item.title}</p>
                        <p className="truncate text-xs text-slate-500">
                          {item.detail}
                          {item.loanId && (
                            <>
                              {" · "}
                              <Link to="/home/loans/$loanId" params={{ loanId: item.loanId }} className="text-blue-600 hover:underline">
                                {T.actions.viewLoan}
                              </Link>
                            </>
                          )}
                        </p>
                      </div>
                      {canResolve && item.active && item.action && (
                        <button
                          type="button"
                          onClick={() => onResolve(item.action!.target)}
                          className="shrink-0 rounded-md px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                        >
                          {item.action.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
        {clearedCount > 0 ? (
          <button type="button" onClick={() => setShowCleared((v) => !v)} className="font-medium text-slate-500 hover:text-slate-700">
            {showCleared ? T.detail.hideCleared : T.detail.showCleared(clearedCount)}
          </button>
        ) : (
          <span />
        )}
        <button type="button" onClick={onOpenProfile} className="font-medium text-blue-600 hover:underline">
          {T.detail.openProfile}
        </button>
      </div>
    </div>
  );
}
