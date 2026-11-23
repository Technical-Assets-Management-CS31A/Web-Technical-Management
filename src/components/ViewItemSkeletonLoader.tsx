const Bone = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200 ${className ?? ""}`} />
);

// Mirrors ViewItem.tsx: back link + actions, hero card, 12 detail cards, history timeline.
export default function ViewItemSkeletonLoader() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back link + actions (QR, condition, delete, edit) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Bone className="h-5 w-36" />
          <div className="flex flex-wrap items-center gap-2">
            <Bone className="h-8 w-20 rounded-md" />
            <Bone className="h-8 w-28 rounded-md" />
            <Bone className="h-8 w-20 rounded-md" />
            <Bone className="h-8 w-16 rounded-md" />
          </div>
        </div>

        {/* Hero card */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex flex-col justify-between gap-4 p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <Bone className="h-3 w-24" />
                <Bone className="h-7 w-64 max-w-full" />
                <Bone className="h-4 w-28" />
              </div>
              <Bone className="h-6 w-24 rounded-full" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Bone className="h-7 w-36 rounded-xl" />
              <Bone className="h-7 w-32 rounded-xl" />
              <Bone className="h-7 w-28 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Detail cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <Bone className="h-8 w-8 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Bone className="h-3 w-16" />
                <Bone className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>

        {/* History timeline */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 space-y-1.5">
            <Bone className="h-4 w-32" />
            <Bone className="h-3 w-56" />
          </div>
          <div className="space-y-5 border-l border-slate-200 pl-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Bone className="h-3.5 w-40" />
                <Bone className="h-3 w-64 max-w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
