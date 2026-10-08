const Bone = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200 ${className ?? ""}`} />
);

export default function BorrowLogsSkeletonLoader() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8">
        {/* Header */}
        <div className="space-y-2">
          <Bone className="h-3 w-24 rounded-full" />
          <Bone className="h-7 w-44" />
          <Bone className="h-4 w-96 max-w-full" />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
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
          <div className="space-y-4 border-b border-slate-200 px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1.5">
                <Bone className="h-5 w-40" />
                <Bone className="h-3 w-20" />
              </div>
              <Bone className="h-10 w-full lg:w-80" />
            </div>
            <div className="flex gap-2">
              {[56, 96, 96, 88].map((w, i) => (
                <div key={i} className="h-7 animate-pulse rounded-full bg-slate-200" style={{ width: w }} />
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {[70, 40, 50, 70, 70, 60, 60, 0].map((w, i) => (
                    <th key={i} className="border-b border-slate-200 px-5 py-3 text-left">
                      {w > 0 && <div className="h-3 animate-pulse rounded bg-slate-200" style={{ width: w }} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from({ length: 8 }).map((_, row) => (
                  <tr key={row}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Bone className="h-9 w-9 rounded-full" />
                        <div className="space-y-1.5">
                          <Bone className="h-3.5 w-28" />
                          <Bone className="h-3 w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="space-y-1.5">
                        <Bone className="h-3.5 w-32" />
                        <Bone className="h-3 w-24" />
                      </div>
                    </td>
                    <td className="px-5 py-3"><Bone className="h-5 w-28" /></td>
                    <td className="px-5 py-3">
                      <div className="space-y-1.5">
                        <Bone className="h-3.5 w-24" />
                        <Bone className="h-3 w-14" />
                      </div>
                    </td>
                    <td className="px-5 py-3"><Bone className="h-5 w-24 rounded-md" /></td>
                    <td className="px-5 py-3"><Bone className="h-3.5 w-14" /></td>
                    <td className="px-5 py-3"><Bone className="h-3.5 w-24" /></td>
                    <td className="px-5 py-3"><Bone className="ml-auto h-4 w-4" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
