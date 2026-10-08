const Bone = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className ?? ""}`} style={style} />
);

export const DashboardSkeletonLoader = () => {
    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 md:px-8">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <Bone className="h-7 w-36" />
                        <Bone className="h-3.5 w-72 max-w-full" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Bone className="h-3.5 w-48" />
                        <Bone className="h-7 w-40 rounded-full" />
                    </div>
                </div>

                {/* ── Stat cards ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5">
                            <div className="space-y-3">
                                <Bone className="h-3.5 w-24" />
                                <Bone className="h-7 w-16" />
                            </div>
                            <Bone className="h-10 w-10" />
                        </div>
                    ))}
                </div>

                {/* ── Insights ───────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
                        <div className="flex justify-between">
                            <div className="space-y-2">
                                <Bone className="h-4 w-40" />
                                <Bone className="h-3.5 w-56" />
                            </div>
                            <Bone className="h-7 w-10" />
                        </div>
                        <div className="mt-6 flex h-44 items-end gap-3">
                            {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                                <div key={i} className="flex flex-1 justify-center">
                                    <Bone className="w-full max-w-10 rounded-b-none" style={{ height: `${h}%` }} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
                        <div className="space-y-2">
                            <Bone className="h-4 w-32" />
                            <Bone className="h-3.5 w-44" />
                        </div>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between">
                                    <Bone className="h-5 w-16 rounded" />
                                    <Bone className="h-3.5 w-12" />
                                </div>
                                <Bone className="h-1.5 w-full rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Table card ─────────────────────────────────────────── */}
                <div className="rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <div className="space-y-1.5">
                            <Bone className="h-4 w-48" />
                            <Bone className="h-3 w-36" />
                        </div>
                        <Bone className="h-3.5 w-14" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-slate-200">
                                <tr>
                                    {[140, 110, 60, 100, 70, 80].map((w, i) => (
                                        <th key={i} className="px-5 py-3 text-left">
                                            <Bone className="h-3 rounded" style={{ width: w }} />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[...Array(5)].map((_, rowIdx) => (
                                    <tr key={rowIdx}>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <Bone className="h-9 w-9 rounded" />
                                                <div className="space-y-1.5">
                                                    <Bone className="h-3.5 w-32" />
                                                    <Bone className="h-3 w-20" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <Bone className="h-3.5 w-24" />
                                        </td>
                                        <td className="px-5 py-3"><Bone className="h-3.5 w-14" /></td>
                                        <td className="px-5 py-3"><Bone className="h-3.5 w-28" /></td>
                                        <td className="px-5 py-3"><Bone className="h-5 w-16 rounded" /></td>
                                        <td className="px-5 py-3"><Bone className="h-3.5 w-20" /></td>
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
