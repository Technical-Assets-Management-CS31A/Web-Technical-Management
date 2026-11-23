import React from "react";

const Bone = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200 ${className ?? ""}`} style={style} />
);

const LoansSkeletonLoader = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8">
        {/* Header */}
        <div className="space-y-2">
          <Bone className="h-3 w-32 rounded-full" />
          <Bone className="h-7 w-64" />
          <Bone className="h-4 w-80 max-w-full" />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
              <div className="space-y-2">
                <Bone className="h-3.5 w-24" />
                <Bone className="h-7 w-12" />
              </div>
              <Bone className="h-10 w-10" />
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {/* Status tabs: All, Active, Overdue, Returned, Missing, each with a count badge */}
          <div className="flex gap-1 overflow-hidden border-b border-slate-200 px-3">
            {[24, 44, 56, 64, 52].map((w, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-3">
                <Bone className="h-4" style={{ width: w }} />
                <Bone className="h-5 w-7 rounded-full" />
              </div>
            ))}
          </div>

          {/* Toolbar: title + live pill, then room filter, sort toggle and search */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Bone className="h-5 w-32" />
                <Bone className="h-5 w-12 rounded-full" />
              </div>
              <Bone className="h-3 w-24" />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex items-center gap-2">
                <Bone className="h-3 w-10" />
                <Bone className="h-9 w-40" />
              </div>
              <Bone className="h-9 w-40" />
              <Bone className="h-10 w-full rounded-xl sm:w-[280px]" />
            </div>
          </div>

          {/* Table: Asset, Borrower, Approved by, Room, Checked out, Custody, Due / Returned, Status, chevron */}
          <div className="overflow-x-auto">
            <div className="min-h-[45vh]">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {[48, 64, 80, 40, 84, 56, 100, 48, 0].map((w, i) => (
                      <th key={i} className="border-b border-slate-200 px-5 py-3 text-left">
                        {w > 0 && <Bone className="h-3 rounded" style={{ width: w }} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...Array(8)].map((_, rowIdx) => (
                    <tr key={rowIdx}>
                      {/* Asset */}
                      <td className="px-5 py-3">
                        <div className="space-y-1.5">
                          <Bone className="h-3.5 w-32" />
                          <Bone className="h-3 w-28" />
                        </div>
                      </td>
                      {/* Borrower */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Bone className="h-8 w-8 shrink-0 rounded-full" />
                          <div className="space-y-1.5">
                            <Bone className="h-3.5 w-28" />
                            <Bone className="h-3 w-20" />
                          </div>
                        </div>
                      </td>
                      {/* Approved by */}
                      <td className="px-5 py-3"><Bone className="h-3.5 w-24" /></td>
                      {/* Room */}
                      <td className="px-5 py-3"><Bone className="h-5 w-14 rounded-md" /></td>
                      {/* Checked out */}
                      <td className="px-5 py-3"><Bone className="h-3.5 w-28" /></td>
                      {/* Custody */}
                      <td className="px-5 py-3"><Bone className="h-5 w-20 rounded" /></td>
                      {/* Due / Returned */}
                      <td className="px-5 py-3"><Bone className="h-5 w-24 rounded-full" /></td>
                      {/* Status */}
                      <td className="px-5 py-3"><Bone className="h-5 w-16 rounded-md" /></td>
                      {/* Chevron */}
                      <td className="px-5 py-3"><Bone className="ml-auto h-4 w-4 rounded" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row">
            <Bone className="h-4 w-40" />
            <div className="flex items-center gap-1">
              <Bone className="h-9 w-20 rounded-xl" />
              <Bone className="h-9 w-9 rounded-xl" />
              <Bone className="h-9 w-9 rounded-xl" />
              <Bone className="h-9 w-16 rounded-xl" />
            </div>
          </div>

          {/* Footer hint */}
          <div className="flex items-start gap-2 border-t border-slate-200 px-5 py-3">
            <Bone className="h-3.5 w-3.5 shrink-0 rounded-full" />
            <Bone className="h-3 w-96 max-w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoansSkeletonLoader;
