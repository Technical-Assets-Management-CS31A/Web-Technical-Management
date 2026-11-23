const Bone = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className ?? ""}`} style={style} />
);

// Mirrors dashboard-view.tsx: header, live status board, room cards, station strip, insights.
export const DashboardSkeletonLoader = () => {
    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 md:px-8">
            <div className="mx-auto max-w-8xl space-y-6">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <Bone className="h-7 w-48" />
                        <Bone className="h-3.5 w-72 max-w-full" />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <Bone className="h-3.5 w-40" />
                        <Bone className="h-7 w-24 rounded-full" />
                        <Bone className="h-7 w-36 rounded-full" />
                    </div>
                </div>

                {/* ── Live status board ──────────────────────────────────── */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Bone className="h-4 w-36" />
                        <Bone className="h-3.5 w-24" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white">
                                <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Bone className="h-4 w-4 rounded" />
                                        <Bone className="h-4 w-20" />
                                    </div>
                                    <Bone className="h-5 w-7 rounded-full" />
                                </div>
                                <div className="flex min-h-32 flex-col gap-2 p-3">
                                    {[...Array((i % 3) + 1)].map((_, j) => (
                                        <div key={j} className="space-y-2 rounded-lg border border-slate-100 px-3 py-2.5">
                                            <div className="flex justify-between gap-2">
                                                <div className="space-y-1.5">
                                                    <Bone className="h-3.5 w-28" />
                                                    <Bone className="h-3 w-16" />
                                                </div>
                                                <Bone className="mt-1.5 h-2 w-2 rounded-full" />
                                            </div>
                                            <Bone className="h-3 w-32" />
                                            <div className="flex justify-between">
                                                <Bone className="h-3 w-14" />
                                                <Bone className="h-3 w-12" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Room cards ─────────────────────────────────────────── */}
                <section className="space-y-3">
                    <div className="space-y-1.5">
                        <Bone className="h-4 w-28" />
                        <Bone className="h-3.5 w-64 max-w-full" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex flex-col rounded-xl border border-slate-200 bg-white">
                                <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
                                    <div className="space-y-1.5">
                                        <Bone className="h-4 w-16" />
                                        <Bone className="h-3 w-32" />
                                    </div>
                                    <Bone className="h-5 w-10 rounded-full" />
                                </div>
                                <div className="space-y-3 px-4 py-3">
                                    <div className="flex items-end justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                                        <div className="space-y-1.5">
                                            <Bone className="h-3.5 w-36" />
                                            <Bone className="h-3 w-24" />
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Bone className="h-5 w-14" />
                                            <Bone className="h-2.5 w-10" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Bone className="h-3 w-24" />
                                        <div className="flex flex-wrap gap-1.5">
                                            {[...Array(4)].map((_, j) => (
                                                <Bone key={j} className="h-5 w-16 rounded" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Station health strip ───────────────────────────────── */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-white px-5 py-3">
                    <div className="flex items-center gap-2">
                        <Bone className="h-4 w-4 rounded" />
                        <Bone className="h-3.5 w-20" />
                    </div>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <Bone className="h-2 w-2 rounded-full" />
                            <Bone className="h-3 w-14" />
                        </div>
                    ))}
                </div>

                {/* ── Insights ───────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                                <Bone className="h-4 w-40" />
                                <Bone className="h-3.5 w-56" />
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <Bone className="h-7 w-10" />
                                <Bone className="h-3 w-16" />
                            </div>
                        </div>
                        <div className="mt-6 flex h-44 items-end gap-3 border-b border-slate-200">
                            {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                                <div key={i} className="flex h-full flex-1 items-end justify-center">
                                    <Bone className="w-full max-w-10 rounded-b-none" style={{ height: `${h}%` }} />
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 flex gap-3">
                            {[...Array(7)].map((_, i) => (
                                <div key={i} className="flex flex-1 justify-center">
                                    <Bone className="h-3 w-8" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
                        <div className="space-y-2">
                            <Bone className="h-4 w-32" />
                            <Bone className="h-3.5 w-44" />
                        </div>
                        <div className="mt-5 space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between">
                                        <Bone className="h-5 w-16 rounded" />
                                        <Bone className="h-3.5 w-14" />
                                    </div>
                                    <Bone className="mt-2 h-1.5 w-full rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
