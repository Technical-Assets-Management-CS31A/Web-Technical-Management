const Bone = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200 ${className ?? ""}`} />
);

export default function SettingsSkeletonLoader() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 md:px-8">
        {/* Header */}
        <div className="space-y-2">
          <Bone className="h-3 w-16 rounded-full" />
          <Bone className="h-7 w-32" />
          <Bone className="h-4 w-72 max-w-full" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
          {/* Navigation */}
          <div className="flex gap-1 lg:flex-col">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                <Bone className="h-8 w-8 rounded-md" />
                <div className="space-y-1.5">
                  <Bone className="h-3.5 w-20" />
                  <Bone className="hidden h-3 w-32 lg:block" />
                </div>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="flex items-end justify-between">
              <div className="space-y-1.5">
                <Bone className="h-5 w-24" />
                <Bone className="h-4 w-64" />
              </div>
              <Bone className="h-9 w-28" />
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
              <Bone className="h-16 w-16 rounded-xl" />
              <div className="space-y-2">
                <Bone className="h-3 w-20" />
                <Bone className="h-5 w-48" />
                <Bone className="h-4 w-56" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {[0, 1].map((section) => (
                <div key={section}>
                  <Bone className="mb-2 h-3 w-36" />
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
                    {[0, 1, 2, 3].map((row) => (
                      <div key={row} className="flex items-center gap-3 px-4 py-3">
                        <Bone className="h-8 w-8" />
                        <div className="space-y-1.5">
                          <Bone className="h-3 w-20" />
                          <Bone className="h-4 w-36" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
