import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Layers, Loader2, Plus, RotateCcw } from "lucide-react";
import { useAllSections, useAllUsers } from "../hooks/userHooks";
import { useAllUsersManagementState } from "../states/user-management-state";
import { UserData, canManageRoster } from "../utils/usersData/userData";
import { fullName } from "../lib/utils";
import SearchBar from "./SearchBar";
import SectionFormDialog from "./SectionFormDialog";
import { getErrorMessage } from "./form/FormKit";

// Sections (GET/POST /sections). Clicking one opens its roster on the Students tab.

export default function SectionsPanel() {
  const viewer = UserData();
  const canManage = canManageRoster(viewer.role);
  const { data: sections = [], isPending, isError, error, refetch } = useQuery(useAllSections());
  const { data: users = [] } = useQuery(useAllUsers());
  const { setActiveTab, setRosterFilter, clearRosterFilters } = useAllUsersManagementState();

  const [search, setSearch] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const schoolYears = useMemo(() => [...new Set(sections.map((s) => s.schoolYear))].sort().reverse(), [sections]);
  const adviser = (id?: string | null) => {
    const user = id ? users.find((u) => u.id === id) : undefined;
    return user ? fullName(user) : "—";
  };

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sections
      .filter((s) => !schoolYear || s.schoolYear === schoolYear)
      .filter((s) => !term || `${s.code} ${s.program}`.toLowerCase().includes(term))
      .sort((a, b) => b.schoolYear.localeCompare(a.schoolYear) || a.code.localeCompare(b.code));
  }, [sections, search, schoolYear]);

  const openRoster = (sectionId: string) => {
    clearRosterFilters();
    setRosterFilter("sectionId", sectionId);
    setActiveTab("students");
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Sections</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {rows.length} section{rows.length === 1 ? "" : "s"} · a section is a code plus a school year
          </p>
        </div>
        <div className="flex flex-col flex-wrap items-stretch gap-2 sm:flex-row sm:items-center lg:justify-end">
          {schoolYears.length > 1 && (
            <select
              aria-label="School year"
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              className="h-[42px] rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:border-blue-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20"
            >
              <option value="">All school years</option>
              {schoolYears.map((sy) => (
                <option key={sy} value={sy}>{sy}</option>
              ))}
            </select>
          )}
          <SearchBar onChangeValue={setSearch} placeholder="Search code or program" />
          {canManage && (
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New section
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="max-h-[60vh] min-h-[45vh] overflow-y-auto">
          {isPending ? (
            <div className="flex items-center justify-center py-24 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading sections" />
            </div>
          ) : isError ? (
            <div role="alert" className="flex flex-col items-center justify-center px-8 py-20 text-center">
              <h3 className="text-sm font-semibold text-slate-900">Could not load sections</h3>
              <p className="mt-1 text-sm text-slate-500">{getErrorMessage(error, "Unknown error")}</p>
              <button type="button" onClick={() => refetch()} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline">
                <RotateCcw className="h-3.5 w-3.5" /> Try again
              </button>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Layers className="h-5 w-5 text-slate-400" />
              </span>
              <h3 className="text-sm font-semibold text-slate-900">{sections.length ? "No sections match" : "No sections yet"}</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {sections.length ? "Try a different search or school year." : "Add sections before adding students or importing a roster."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="sticky top-0 z-10 bg-slate-50">
                  {["Section", "Program", "Year level", "School year", "Adviser"].map((h) => (
                    <th key={h} className="border-b border-slate-200 px-5 py-3 font-medium text-slate-500">{h}</th>
                  ))}
                  <th className="w-12 border-b border-slate-200 px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((section) => (
                  <tr
                    key={section.id}
                    onClick={() => openRoster(section.id)}
                    className="group cursor-pointer transition-colors hover:bg-slate-50"
                    title={`Show students in ${section.code}`}
                  >
                    <td className="px-5 py-3 font-mono font-medium text-slate-900">{section.code}</td>
                    <td className="px-5 py-3 text-slate-600">{section.program}</td>
                    <td className="px-5 py-3 text-slate-600">Year {section.yearLevel}</td>
                    <td className="px-5 py-3 tabular-nums text-slate-600">{section.schoolYear}</td>
                    <td className="px-5 py-3 text-slate-600">{adviser(section.adviserUserId)}</td>
                    <td className="px-5 py-3 text-right text-slate-300 group-hover:text-slate-500">
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <p className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">Click a section to see its students.</p>

      {isAddOpen && <SectionFormDialog onClose={() => setIsAddOpen(false)} />}
    </section>
  );
}
