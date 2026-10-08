import React from "react";

const Bone = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200 ${className ?? ""}`} style={style} />
);

const ActiveBorrowedItemsSkeletonLoader = () => {
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
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1.5">
              <Bone className="h-5 w-40" />
              <Bone className="h-3 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Bone className="h-8 w-44" />
              <Bone className="h-9 w-56" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {[120, 120, 60, 100, 80, 90, 60].map((w, i) => (
                    <th key={i} className="border-b border-slate-200 px-5 py-3 text-left">
                      <Bone className="h-3 rounded" style={{ width: w }} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...Array(8)].map((_, rowIdx) => (
                  <tr key={rowIdx}>
                    {/* Item */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Bone className="h-10 w-10" />
                        <div className="space-y-1.5">
                          <Bone className="h-3.5 w-32" />
                          <Bone className="h-3 w-20" />
                        </div>
                      </div>
                    </td>
                    {/* Borrower */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Bone className="h-8 w-8 rounded-full" />
                        <div className="space-y-1.5">
                          <Bone className="h-3.5 w-28" />
                          <Bone className="h-3 w-24" />
                        </div>
                      </div>
                    </td>
                    {/* Room */}
                    <td className="px-5 py-3">
                      <Bone className="h-5 w-14 rounded-md" />
                    </td>
                    {/* Lent At */}
                    <td className="px-5 py-3">
                      <Bone className="h-3.5 w-28" />
                    </td>
                    {/* Time Out */}
                    <td className="px-5 py-3">
                      <Bone className="h-5 w-16 rounded-full" />
                    </td>
                    {/* Remarks */}
                    <td className="px-5 py-3">
                      <Bone className="h-3.5 w-24" />
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Bone className="h-7 w-20 rounded-md" />
                        <Bone className="h-4 w-4 rounded" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveBorrowedItemsSkeletonLoader;
